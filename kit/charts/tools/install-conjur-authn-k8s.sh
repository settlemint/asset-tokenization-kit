#!/usr/bin/env bash
set -euo pipefail

# Installs Conjur OSS via Helm and enables authn-k8s for a target service account.

CONJUR_NS=${CONJUR_NS:-conjur}
CONJUR_RELEASE=${CONJUR_RELEASE:-conjur}
CONJUR_ACCOUNT=${CONJUR_ACCOUNT:-atk}
AUTHN_ID=${AUTHN_ID:-orbstack}
SA_NS=${SA_NS:-atk}
SA_NAME=${SA_NAME:-besu-nodes}
TOKEN_AUDIENCE=${TOKEN_AUDIENCE:-https://kubernetes.default.svc.cluster.local}

helm repo add cyberark https://cyberark.github.io/helm-charts >/dev/null 2>&1 || true
helm repo update >/dev/null 2>&1
kubectl create namespace "$CONJUR_NS" --dry-run=client -o yaml | kubectl apply -f -

if ! helm status "$CONJUR_RELEASE" -n "$CONJUR_NS" >/dev/null 2>&1; then
  # Reuse existing Conjur data key if present to avoid unnecessary pod restarts.
  if [[ -z ${DATA_KEY:-} ]]; then
    EXISTING_KEY=$(kubectl get secret -n "$CONJUR_NS" "${CONJUR_RELEASE}-conjur-data-key" -o jsonpath='{.data.key}' 2>/dev/null || true)
    if [[ -n $EXISTING_KEY ]]; then
      DATA_KEY=$(printf '%s' "$EXISTING_KEY" | base64 --decode)
    else
      DATA_KEY=$(openssl rand -base64 32 | tr -d '\n')
    fi
  fi
  helm upgrade --install "$CONJUR_RELEASE" cyberark/conjur-oss \
    --namespace "$CONJUR_NS" \
    --wait \
    --set account.create=true \
    --set account.name="$CONJUR_ACCOUNT" \
    --set-string authenticators=authn\\,authn-k8s/$AUTHN_ID \
    --set dataKey="$DATA_KEY" \
    --set service.external.enabled=false \
    --set service.internal.type=ClusterIP
else
  echo "Helm release $CONJUR_RELEASE already present in namespace $CONJUR_NS; skipping helm upgrade."
fi

kubectl wait -n "$CONJUR_NS" --for=condition=Available deploy/"$CONJUR_RELEASE"-conjur-oss --timeout=5m

kubectl apply -n "$CONJUR_NS" -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: conjur-cli
spec:
  restartPolicy: Never
  serviceAccountName: ${CONJUR_RELEASE}-conjur-oss
  containers:
    - name: cli
      image: cyberark/conjur-cli:9.0.0
      command: ["sleep","infinity"]
EOF

kubectl wait -n "$CONJUR_NS" --for=condition=Ready pod/conjur-cli --timeout=2m

POD_NAME=$(kubectl get pods -n "$CONJUR_NS" -l "app=conjur-oss,release=$CONJUR_RELEASE" -o jsonpath='{.items[0].metadata.name}')
ADMIN_PASS=$(kubectl exec -n "$CONJUR_NS" "$POD_NAME" -c conjur-oss -- conjurctl role retrieve-key "$CONJUR_ACCOUNT:user:admin" | tail -1 | tr -d '\r')

POLICY_FILE=$(mktemp)
cat >"$POLICY_FILE" <<EOF
- !policy
  id: conjur/authn-k8s/$AUTHN_ID
  body:
    - !webservice
    - !group clients
    - !variable
      id: ca-cert
    - !variable
      id: token-audience
    - !host
      id: apps/$SA_NS/$SA_NAME
      annotations:
        authn-k8s/namespace: $SA_NS
        authn-k8s/service-account: $SA_NAME
    - !grant
      role: !group clients
      member: !host apps/$SA_NS/$SA_NAME
    - !permit
      role: !group clients
      privilege: [ authenticate ]
      resource: !webservice
EOF

CA_FILE=$(mktemp)
kubectl get secret -n "$CONJUR_NS" "${CONJUR_RELEASE}-conjur-ssl-ca-cert" -o jsonpath='{.data.tls\.crt}' | base64 --decode >"$CA_FILE"

K8S_CA_FILE=$(mktemp)
kubectl get configmap -n kube-system extension-apiserver-authentication -o jsonpath='{.data.client-ca-file}' >"$K8S_CA_FILE"

kubectl cp "$CA_FILE" "$CONJUR_NS/conjur-cli:/tmp/conjur-ca.pem"
kubectl cp "$POLICY_FILE" "$CONJUR_NS/conjur-cli:/tmp/authn-k8s.yml"
kubectl cp "$K8S_CA_FILE" "$CONJUR_NS/conjur-cli:/tmp/k8s-ca.pem"

# configure conjur cli inside helper pod
CONJUR_FQDN="${CONJUR_RELEASE}-conjur-oss.${CONJUR_NS}.svc.cluster.local"
kubectl exec -n "$CONJUR_NS" conjur-cli -- bash -lc "set -euo pipefail
export CONJURRC=/home/cli/.conjurrc
conjur init self-hosted --url https://$CONJUR_FQDN --account $CONJUR_ACCOUNT --ca-cert=/tmp/conjur-ca.pem --force --file=/home/cli/.conjurrc
conjur login --id admin --password \"$ADMIN_PASS\"
conjur policy load --branch root --file /tmp/authn-k8s.yml
conjur variable set --id conjur/authn-k8s/$AUTHN_ID/ca-cert --file /tmp/k8s-ca.pem
conjur variable set --id conjur/authn-k8s/$AUTHN_ID/token-audience --value \"$TOKEN_AUDIENCE\""

rm -f "$POLICY_FILE" "$CA_FILE" "$K8S_CA_FILE"

echo "Conjur OSS ready in namespace $CONJUR_NS with authn-k8s/$AUTHN_ID enabled. CLI pod: ${CONJUR_NS}/conjur-cli."
