import { Address } from "../value-objects/Address.js"
import { EmergencyContact } from "../value-objects/EmergencyContact.js"
import { MedicalRecord } from "../value-objects/medical-record/MedicalRecord.js"

export interface PatientData {
  identificationDocument: string
  name: string
  birthDate: string | Date
  gender: string
  bloodType: string
  address: Address
  phone: string
  email: string
  emergencyContact: EmergencyContact
}

export class Patient {
  #id?: string
  readonly #identificationDocument: string
  #name: string
  readonly #birthDate: Date
  readonly #gender: string
  readonly #bloodType: string
  #address: Address
  #phone: string
  #email: string
  #emergencyContact: EmergencyContact
  readonly #medicalRecord: MedicalRecord

  constructor(data: PatientData) {
    if (!data.identificationDocument) {
      throw new Error("Identification document is required")
    }
    if (!data.name) {
      throw new Error("Name is required")
    }
    if (!data.email) {
      throw new Error("Email is required")
    }

    this.#identificationDocument = data.identificationDocument
    this.#name = data.name
    this.#birthDate = new Date(data.birthDate)
    this.#gender = data.gender
    this.#bloodType = data.bloodType
    this.#address = data.address
    this.#phone = data.phone
    this.#email = data.email
    this.#emergencyContact = data.emergencyContact
    this.#medicalRecord = new MedicalRecord()
  }

  get id(): string | undefined {
    return this.#id
  }

  get identificationDocument(): string {
    return this.#identificationDocument
  }

  get name(): string {
    return this.#name
  }

  get birthDate(): Date {
    return new Date(this.#birthDate)
  }

  get gender(): string {
    return this.#gender
  }

  get bloodType(): string {
    return this.#bloodType
  }

  get address(): Address {
    return this.#address
  }

  get phone(): string {
    return this.#phone
  }

  get email(): string {
    return this.#email
  }

  get emergencyContact(): EmergencyContact {
    return this.#emergencyContact
  }

  // CORREÇÃO: Retornar o próprio objeto MedicalRecord (ainda é imutável pelos arrays)
  get medicalRecord(): MedicalRecord {
    return this.#medicalRecord
  }

  _setId(id: string): void {
    this.#id = id
  }

  set name(newName: string) {
    if (!newName) {
      throw new Error("Name cannot be empty")
    }
    this.#name = newName
  }

  set phone(newPhone: string) {
    if (!newPhone) {
      throw new Error("Phone cannot be empty")
    }
    this.#phone = newPhone
  }

  set email(newEmail: string) {
    if (!newEmail) {
      throw new Error("Email cannot be empty")
    }
    this.#email = newEmail
  }

  set emergencyContact(newEmergencyContact: EmergencyContact) {
    if (!(newEmergencyContact instanceof EmergencyContact)) {
      throw new Error("Invalid emergency contact")
    }
    this.#emergencyContact = newEmergencyContact
  }

  set address(newAddress: Address) {
    if (!(newAddress instanceof Address)) {
      throw new Error("Invalid address")
    }
    this.#address = newAddress
  }

  getAge(): number {
    const today = new Date()
    const birthDate = this.#birthDate
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }
}

export const addPatient = (data: PatientData): Patient => {
  return new Patient(data)
}
