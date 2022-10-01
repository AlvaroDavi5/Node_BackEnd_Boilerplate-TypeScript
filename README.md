
# Getting Started

Wello! Welcome to MyWorkspace project. :notebook_with_decorative_cover: :bookmark_tabs:  
**MyWorkspace** is a web platform (and _Progressive Web App_) aimed at teachers, so they can organize their tasks, projects and academic study contents.

---

First, install all packages using _yarn_, for it enter in the repo directory and search by `package.json` file:
```sh
# install all packages from package.json
yarn install
```
Check the [Considerations](#package-manager-considerations) to understand the reason for using yarn.
<br>

After, run the development server with _npm_:
```sh
# run the development server
yarn run dev

	# or

npm run dev
```

Or run the production server:
```sh
# run the build process
yarn run build
# start production server
yarn start

	# or

npm run build
npm start
```

Finally, open  

* to development server  
[localhost:8080](http://localhost:8080/)  
* to production server  
[localhost:3000](http://localhost:3000/)  

on your browser to see the result.

___

## package-manager-considerations

The packages used need to be installed via yarn, due to the incompatibility of dependencies by npm. However, once installed, the application can be runned via yarn or npm.
