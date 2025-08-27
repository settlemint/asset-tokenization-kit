# Darwin (macOS) System Commands

## File System Navigation
```bash
ls -la              # List files with details
cd <directory>      # Change directory
pwd                 # Print working directory
mkdir -p <path>     # Create directory (with parents)
rm -rf <path>       # Remove files/directories
cp -r <src> <dst>   # Copy recursively
mv <src> <dst>      # Move/rename files
```

## File Search & Content
```bash
find . -name "*.ts"        # Find files by name
grep -r "pattern" .        # Search in files recursively
ripgrep/rg "pattern"       # Fast search (if installed)
cat <file>                 # Display file content
head -n 20 <file>         # Show first 20 lines
tail -n 20 <file>         # Show last 20 lines
tail -f <file>            # Follow file updates
```

## Process Management
```bash
ps aux | grep <name>      # Find processes
kill -9 <pid>            # Force kill process
lsof -i :8545            # Check port usage
top                      # System monitor
```

## Network & Ports
```bash
netstat -an | grep LISTEN # List listening ports
lsof -i tcp:3000         # Check specific port
curl http://localhost:8545 # Test HTTP endpoint
```

## Git Commands
```bash
git status               # Check repository status
git diff                 # Show unstaged changes
git diff --staged        # Show staged changes
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git push                 # Push to remote
git pull                 # Pull from remote
git checkout -b <branch> # Create and switch branch
git log --oneline -10    # Show recent commits
```

## Docker Commands
```bash
docker ps                # List running containers
docker ps -a            # List all containers
docker logs <container>  # View container logs
docker exec -it <container> bash  # Enter container
docker compose up -d     # Start services detached
docker compose down      # Stop services
docker compose logs -f   # Follow logs
```

## Package Management (Bun)
```bash
bun install             # Install dependencies
bun add <package>       # Add package
bun remove <package>    # Remove package
bun run <script>        # Run package.json script
bunx <command>          # Execute package binary
```

## Environment Variables
```bash
echo $VAR               # Print variable
export VAR=value        # Set variable
env | grep VAR          # Search variables
source .env             # Load env file
```

## File Permissions (Unix-style on Darwin)
```bash
chmod +x <file>         # Make executable
chmod 755 <file>        # Set permissions
chown user:group <file> # Change ownership
```

## macOS Specific
```bash
open .                  # Open in Finder
open -a "Visual Studio Code" . # Open in VS Code
pbcopy < file           # Copy file to clipboard
pbpaste > file          # Paste clipboard to file
say "Build complete"    # Text to speech notification
```

## Useful Aliases (if configured)
```bash
ll                      # Alias for ls -la
..                      # Go up one directory
...                     # Go up two directories
```