const rethinkDb = require("rethink-crud");
const cuid = require("cuid");

class Bank {

  constructor(identifiers = null) {
    this.initializeBankCollection();
    if (identifiers && Object.keys(identifiers).length) {
      this.setIndetifiers(identifiers);
    }
  }

  initializeBankCollection() {
    const deepPocketDbRef = new rethinkDb(process.env.DB_NAME);
    this.bankCollectionRef = deepPocketDbRef.collection("banks");
  }

  setIndetifiers(identifiers) {
    this.identifiers = identifiers;
	}
	
  async fetchBankData() {
    const docs = await this.bankCollectionRef.get(this.identifiers? this.identifiers: {});
    if (docs && docs.length) {
      this.bankData = docs[0];
    }
    return;
  }

  getData() {
    if (this.bankData && Object.keys(this.bankData).length) {
      return bankData;
    }
    return null;
  }

  async checkIfExists(identifiers) {
    this.setIndetifiers(identifiers);
    await this.fetchBankData();
    return !!this.bankData;
	}

	setUser(user) {
		this.user = user.getData();;
	}
	
	async create(bankData) {
		const bankId = cuid();
		const bank = { id: bankId, ...bankData, userId: this.user.id };
    await this.userCollectionRef.add(bank);
		this.setIndetifiers({id: bankId});
		await this.fetchBankData();
    return this.bankData;
	}

	async update(bank) {
		await this.fetchBankData();
    await this.userCollectionRef.add({...this.bankData , ...bank}, {...this.bankData});
    return bank;
	}
}

module.exports = Bank;
