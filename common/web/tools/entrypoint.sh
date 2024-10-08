#!/bin/bash

# Ajouter l'entrée dans /etc/hosts
if ! grep -q "172.17.0.1 host.docker.internal" /etc/hosts; then
    echo "172.17.0.1    host.docker.internal" >> /etc/hosts
fi

# Lancer les commandes suivantes (ici démarrage du serveur Django)
exec "$@"

