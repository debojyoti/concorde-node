const rethinkDb = require("rethink-crud");
const cuid = require("cuid");

class User {

  constructor(identifiers = null) {
    this.initializeUserCollection();
    if (identifiers && Object.keys(identifiers).length) {
      this.setIndetifiers(identifiers);
    }
  }

  initializeUserCollection() {
    const deepPocketDbRef = new rethinkDb(process.env.DB_NAME);
    this.userCollectionRef = deepPocketDbRef.collection("users");
  }

  setIndetifiers(identifiers) {
    this.identifiers = identifiers;
  }

  verifyPassword(password) {
    console.log('this.userData :>> ', this.userData);
    if (this.userData.password === password) {
      return true;
    } else {
      return false;
    }
  }

  async extractUserData() {
    const docs = await this.userCollectionRef.get(this.identifiers? this.identifiers: {});
    if (docs && docs.length) {
      this.userData = docs[0];
    }
    return;
  }

  getData() {
    if (this.userData && Object.keys(this.userData).length) {
      const userData = {...this.userData};
      delete userData.password;
      return userData;
    }
    return null;
  }

  async checkIfExists(identifiers) {
    this.setIndetifiers(identifiers);
    await this.extractUserData(identifiers);
    return !!this.userData;
  }

  async register(user) {
    const userData = { id: cuid(), ...user };
    await this.userCollectionRef.add(userData);
    return userData;
  }

  async getAllUsers() {
    const allUsers = await this.userCollectionRef.get();
    return allUsers;
  }

  async listBanks() {
    const bankCollectionRef = deepPocketDbRef.collection("banks");
    const allBanks = await bankCollectionRef.get();
    return allBanks;
  }

  async removeAllUsers() {
    await this.userCollectionRef.deleteDocs();
  }
}

module.exports = User;
