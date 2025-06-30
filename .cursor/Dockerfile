# Use Node as base image
FROM node:24.3.0

# Install system dependencies and development tools as root
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

# Create cursor user with sudo privileges
RUN useradd -m -s /bin/bash cursor && \
    usermod -aG sudo cursor && \
    usermod -aG docker cursor && \
    echo "cursor ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Switch to cursor user
USER cursor
WORKDIR /home/cursor

# Install Homebrew (Linuxbrew) as cursor user
RUN git clone https://github.com/Homebrew/brew /home/cursor/.linuxbrew && \
    /home/cursor/.linuxbrew/bin/brew shellenv >> /home/cursor/.bashrc && \
    /home/cursor/.linuxbrew/bin/brew shellenv >> /home/cursor/.profile

ENV PATH="/home/cursor/.linuxbrew/bin:/home/cursor/.linuxbrew/sbin:$PATH"
ENV HOMEBREW_PREFIX="/home/cursor/.linuxbrew"
ENV HOMEBREW_CELLAR="/home/cursor/.linuxbrew/Cellar"
ENV HOMEBREW_REPOSITORY="/home/cursor/.linuxbrew/Homebrew"

# Configure npm to install global packages in user directory
RUN mkdir -p /home/cursor/.npm-global && \
    npm config set prefix '/home/cursor/.npm-global'
ENV PATH="/home/cursor/.npm-global/bin:$PATH"

# Install global development tools as cursor user
RUN npm install -g turbo

# Install SettleMint CLI as cursor user
RUN npm install -g @settlemint/sdk-cli

# Install Foundry for smart contract development as cursor user
RUN curl -L https://foundry.paradigm.xyz | bash && \
    /home/cursor/.foundry/bin/foundryup

# Add Foundry to PATH
ENV PATH="/home/cursor/.foundry/bin:$PATH"

# Install helm-docs using Homebrew (matching GitHub Actions workflow)
RUN brew install norwoodj/tap/helm-docs ast-grep yq helm oven-sh/bun/bun

# Set working directory
WORKDIR /home/cursor

# Add any additional development tools or configurations needed
# Note: Do NOT copy code - it will be cloned by the agent later
