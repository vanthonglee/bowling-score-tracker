# Stop all running containers
docker kill $(docker ps -q) && docker rm $(docker ps -a -q)