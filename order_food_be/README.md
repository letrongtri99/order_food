docker run \
  -p 0.0.0.0:3333:3306 \
  --name test \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_USER=test \
  -e MYSQL_PASSWORD=test \
  -e MYSQL_DATABASE=now_clone \
  -d mysql:5.7.20


  migration:
  ~ npx typeorm migration:create -n FakeOne

  redis:
  ~ redis-server --daemonize yes