# Use Node as base image
FROM node:24.3.0

# Install system dependencies and development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    python3 \
    sudo \
    jq \
    postgresql-client \
    # Docker dependencies
    ca-certificates \
    gnupg \
    lsb-release \
    # Additional utilities from qa.yml
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Docker
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin && \
    rm -rf /var/lib/apt/lists/*

# Install Homebrew (Linuxbrew)
RUN git clone https://github.com/Homebrew/brew /home/linuxbrew/.linuxbrew && \
    chmod -R go-w /home/linuxbrew/.linuxbrew

ENV PATH="/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:$PATH"
ENV HOMEBREW_PREFIX="/home/linuxbrew/.linuxbrew"
ENV HOMEBREW_CELLAR="/home/linuxbrew/.linuxbrew/Cellar"
ENV HOMEBREW_REPOSITORY="/home/linuxbrew/.linuxbrew/Homebrew"

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Install global development tools
RUN npm install -g turbo

# Install SettleMint CLI
RUN npm install -g @settlemint/sdk-cli

# Install Foundry for smart contract development
RUN curl -L https://foundry.paradigm.xyz | bash && \
    /root/.foundry/bin/foundryup

# Install helm-docs using Homebrew (matching GitHub Actions workflow)
RUN brew install norwoodj/tap/helm-docs ast-grep yq helm

# Add Foundry to PATH
ENV PATH="/root/.foundry/bin:$PATH"

# Set working directory
WORKDIR /root

# Add any additional development tools or configurations needed
# Note: Do NOT copy code - it will be cloned by the agent later
