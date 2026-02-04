import type { Parcel } from "./types"

// Mock data store
let parcels: Parcel[] = [
  {
    id: "P001",
    roomNumber: "101",
    recipientName: "สมชาย ใจดี",
    phoneNumber: "0812345678",
    deliveryCompany: "Kerry Express",
    createdAt: new Date("2024-02-03T10:30:00"),
    status: "pending",
  },
  {
    id: "P002",
    roomNumber: "102",
    recipientName: "สมหญิง ใจงาม",
    phoneNumber: "0823456789",
    deliveryCompany: "J&T Express",
    createdAt: new Date("2024-02-03T11:45:00"),
    status: "notified",
  },
  {
    id: "P003",
    roomNumber: "103",
    recipientName: "วิทยา ลาภา",
    phoneNumber: "0834567890",
    deliveryCompany: "GrabExpress",
    createdAt: new Date("2024-02-03T12:15:00"),
    status: "delivered",
  },
]

export function getParcels(): Parcel[] {
  return [...parcels]
}

export function searchParcels(query: string): Parcel[] {
  const lowerQuery = query.toLowerCase()
  return parcels.filter(
    (p) =>
      p.roomNumber.toLowerCase().includes(lowerQuery) ||
      p.recipientName.toLowerCase().includes(lowerQuery) ||
      p.phoneNumber.includes(lowerQuery)
  )
}

export function getPendingParcelsCount(): number {
  return parcels.filter((p) => p.status === "pending").length
}

export function addParcel(data: Omit<Parcel, "id" | "createdAt">): string {
  const id = `P${String(parcels.length + 1).padStart(3, "0")}`
  const parcel: Parcel = {
    ...data,
    id,
    createdAt: new Date(),
  }
  parcels.push(parcel)
  return id
}

export function updateParcelStatus(id: string, status: Parcel["status"]): void {
  const parcel = parcels.find((p) => p.id === id)
  if (parcel) {
    parcel.status = status
  }
}

export function getParcelById(id: string): Parcel | undefined {
  return parcels.find((p) => p.id === id)
}

export function deleteParcel(id: string): void {
  parcels = parcels.filter((p) => p.id !== id)
}
