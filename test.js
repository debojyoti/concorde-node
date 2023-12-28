(async () => {
  try {
    // All other imports
    const rethinkDb = require("rethink-crud");
    const cuid = require("cuid");

    await rethinkDb.startEngine({
      host: "localhost",
      port: 28015,
    });

    // // Create the db
    // await rethinkDb.createDb("deep-pocket");

    // // Select db
    // const deepPocketDbRef = new rethinkDb("deep-pocket");
    // // Create collections
    // await deepPocketDbRef.createCollection("users");
    // // Show all collections
    // const collections = await deepPocketDbRef.listCollections();
    // console.log("collections :>> ", collections);

    const deep1 = new rethinkDb("deep-pocket");
    const usersCol  = deep1.collection("users");
    // await usersCol.add([{id: cuid(), name: "John"}])
    // console.log('After john insert :>> ', await usersCol.getDocs());
    // await usersCol.add([{id: cuid(), name: "Jenny"}])
    // console.log('After Jenny insert :>> ', await usersCol.getDocs());
    // await usersCol.add({id: cuid(), name: "Attila"})
    // console.log('After Attila insert :>> ', await usersCol.getDocs());
    
    await usersCol.delete();
    console.log('After delete :>> ', await usersCol.get());
  } catch (error) {
    console.log("error :>> ", error);
  }
})();
