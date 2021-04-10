#!/bin/bash
set -e

LOG_PREFIX=[DEPLOY]
DOCKER_IMAGE=epidemics-ui
DOCKER_ENGINE_IMAGE=epidemics-engine
DOCKER_IMAGES_PATH=/usr/local/share/docker-images
DOCKER_ARCHIVE=$DOCKER_IMAGE.tar
REMOTE_USER=root
REMOTE_HOST=vps295604.ovh.net

PASSWORD=$1
if [ -z $PASSWORD ];
    then
        echo -n "$REMOTE_USER@$REMOTE_HOST password: "
        read -s PASSWORD
        echo
fi

echo "$LOG_PREFIX (0/6) Building epidemics/engine image $DOCKER_ENGINE_IMAGE..."
cd ../engine
docker build -t $DOCKER_ENGINE_IMAGE .
cd ../ui
echo "$LOG_PREFIX (0/6) Done."

echo "$LOG_PREFIX (1/6) Building Docker image $DOCKER_IMAGE..."
docker build -t $DOCKER_IMAGE .
echo "$LOG_PREFIX (1/6) Done."

echo "$LOG_PREFIX (2/6) Archiving Docker image $DOCKER_IMAGE to $DOCKER_ARCHIVE..."
docker save $DOCKER_IMAGE > $DOCKER_ARCHIVE
echo "$LOG_PREFIX (2/6) Done."

echo "$LOG_PREFIX (3/6) Copying archive $DOCKER_ARCHIVE to $REMOTE_HOST at $DOCKER_IMAGES_PATH..."
sshpass -p $PASSWORD scp ./$DOCKER_IMAGE.tar root@vps295604.ovh.net:$DOCKER_IMAGES_PATH
echo "$LOG_PREFIX (3/6) Done."

echo "$LOG_PREFIX (4/6) Checking for running container of image $DOCKER_IMAGE on $REMOTE_HOST..."
RUNNING_IMAGES=$(sshpass -p $PASSWORD ssh $REMOTE_USER@$REMOTE_HOST docker ps -a -q -f ancestor=$DOCKER_IMAGE)
if [ -n "${RUNNING_IMAGES}" ]
    then
        echo "$LOG_PREFIX (4/6) Found running containers."
        echo "$LOG_PREFIX (4/6) Deleting running containers..."
        sshpass -p $PASSWORD ssh $REMOTE_USER@$REMOTE_HOST "docker rm -f ${RUNNING_IMAGES}"
    else
        echo "$LOG_PREFIX (4/6) No running container found."
fi
echo "$LOG_PREFIX (4/6) Done."

echo "$LOG_PREFIX (5/6) Loading image $DOCKER_IMAGE from archive $DOCKER_IMAGES_PATH/$DOCKER_ARCHIVE..."
sshpass -p $PASSWORD ssh $REMOTE_USER@$REMOTE_HOST "docker load < $DOCKER_IMAGES_PATH/$DOCKER_ARCHIVE"
echo "$LOG_PREFIX (5/6) Done."

echo "$LOG_PREFIX (6/6) Running new container from image $DOCKER_IMAGE..."
sshpass -p $PASSWORD ssh $REMOTE_USER@$REMOTE_HOST "docker run --restart unless-stopped -p 80:80 -d $DOCKER_IMAGE"
echo "$LOG_PREFIX (6/6) Done."

echo "$LOG_PREFIX Application $DOCKER_IMAGE successfully deployed at http://$REMOTE_HOST/."