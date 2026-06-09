# packaging-check-list


backend api

https://tgpackagingappprd.azurewebsites.net/api/v1/

postman documentation url

https://documenter.getpostman.com/view/29626607/2sBXiojUps

node seeders/roles.js seed    # Create roles (skip existing)
node seeders/roles.js update  # Update existing roles
node seeders/roles.js list    # List all roles
node seeders/roles.js all     # Seed and list



npx sequelize-cli db:migrate