export interface Parcel {
  id: string
  roomNumber: string
  recipientName: string
  phoneNumber: string
  deliveryCompany: string
  createdAt: Date
  status: "pending" | "notified" | "delivered"
}

export interface Recipient {
  id: string
  roomNumber: string
  name: string
  phone: string
  phoneNumber?: string
}

export interface DeliveryCompany {
  id: string
  name: string
  logo?: string
  color?: string
}

export const MOCK_RECIPIENTS: Recipient[] = [
  { id: "1", roomNumber: "101", name: "สมชาย ใจดี", phone: "0812345678" },
  { id: "2", roomNumber: "102", name: "สมหญิง ใจงาม", phone: "0823456789" },
  { id: "3", roomNumber: "103", name: "วิทยา ลาภา", phone: "0834567890" },
  { id: "4", roomNumber: "201", name: "สมศักดิ์ มั่นคง", phone: "0845678901" },
  { id: "5", roomNumber: "202", name: "นวลจันทร์ สว่างใจ", phone: "0856789012" },
]

export const DELIVERY_COMPANIES: DeliveryCompany[] = [
  { id: "1", name: "Kerry Express", color: "#E67E22" },
  { id: "2", name: "Flash Express", color: "#F1C40F" },
  { id: "3", name: "J&T Express", color: "#E74C3C" },
  { id: "4", name: "Shopee Express", color: "#E67E22" },
  { id: "5", name: "Lazada Express", color: "#3B5BDB" },
  { id: "6", name: "Thailand Post", color: "#8B4513" },
  { id: "7", name: "DHL", color: "#D4A500" },
]
