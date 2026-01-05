# Transport System - Architecture & Data Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FarmConnect Platform                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
        │   Farmer     │ │ Trader   │ │Transport │
        │  Dashboard   │ │Dashboard │ │Dashboard │
        └──────────────┘ └──────────┘ └──────────┘
                │             │             │
                │             │             │
        ┌───────▼─────────────▼─────────────▼───────┐
        │        Frontend (React Components)         │
        ├───────────────────────────────────────────┤
        │ Pages, Forms, Lists, Dashboards           │
        └──────────────────┬──────────────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │    API Layer (Express Backend)      │
        ├──────────────────────────────────────┤
        │ REST Endpoints, Controllers, Auth   │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │    Database Layer (MongoDB)         │
        ├──────────────────────────────────────┤
        │ Collections, Indexes, Schemas       │
        └──────────────────────────────────────┘
```

---

## Component Interaction Flow

### Transporter Workflow

```
┌─────────────────────────────────────────────────────────┐
│              TRANSPORTER WORKFLOW                        │
└─────────────────────────────────────────────────────────┘

1. VEHICLE SETUP
   ┌────────────────────────────────┐
   │ VehicleManagement.js (List)    │
   │        ↓                        │
   │ AddVehicle.js (Form)           │
   │        ↓                        │
   │ vehicleManagementController    │
   │    (addVehicle)                │
   │        ↓                        │
   │ TransporterVehicle Model       │
   │   (Save with weight slab)      │
   └────────────────────────────────┘

2. ORDER DISCOVERY
   ┌────────────────────────────────┐
   │ AvailableOrders.js (List)      │
   │        ↓                        │
   │ /api/vehicles/orders/available │
   │        ↓                        │
   │ Order.find() Filter            │
   │  (Ready for Pickup)            │
   └────────────────────────────────┘

3. VEHICLE MATCHING
   ┌────────────────────────────────┐
   │ Order Selected                 │
   │        ↓                        │
   │ Quantity to KG Conversion      │
   │        ↓                        │
   │ /api/vehicles/suggest/{orderId}│
   │        ↓                        │
   │ TransporterVehicle.find()      │
   │  (weight range match)          │
   │        ↓                        │
   │ Suggested Vehicles Display     │
   └────────────────────────────────┘

4. ORDER ACCEPTANCE
   ┌────────────────────────────────┐
   │ Select Vehicle                 │
   │        ↓                        │
   │ Click "Accept Order"           │
   │        ↓                        │
   │ /api/transport/accept/{orderId}│
   │        ↓                        │
   │ Transport Record Created       │
   │        ↓                        │
   │ Order Status Updated           │
   │  (In Transit)                  │
   └────────────────────────────────┘

5. DELIVERY MANAGEMENT
   ┌────────────────────────────────┐
   │ Active Deliveries List         │
   │        ↓                        │
   │ Update Status                  │
   │  (Picked Up → In Transit →     │
   │   Delivered)                   │
   │        ↓                        │
   │ /api/transport/status/{id}     │
   │        ↓                        │
   │ Complete Delivery              │
   └────────────────────────────────┘
```

---

## Data Models Relationship

```
┌──────────────────────────────────────────────────────────────┐
│                    USER (Transporter)                        │
│  _id, name, phone, email, role: "transport"                │
└────────────────┬─────────────────────────────────────────────┘
                 │
         ┌───────┴─────────┬────────────────┐
         │                 │                │
    ┌────▼──────────┐  ┌───▼──────────┐  ┌─▼────────────┐
    │ TransporterV  │  │ Transport    │  │ Location     │
    │ ehicle        │  │ (Deliveries) │  │ Update       │
    │               │  │              │  │              │
    │ _id           │  │ _id          │  │ _id          │
    │ vehicleName   │  │ orderId   ───┼──┼→ Order       │
    │ vehicleNumber │  │ transportId  │  │ transportId  │
    │ vehicleType   │  │ status       │  │              │
    │ weightSlab    │  │ pickupLoc    │  │              │
    │ baseFare      │  │ deliveryLoc  │  │              │
    │ farePerKm     │  │ deliveryFee  │  │              │
    │ isActive      │  │              │  │              │
    │ availability  │  │              │  │              │
    │ Status        │  │              │  │              │
    └────────────────┘  └───┬──────────┘  └────────────┘
                            │
                        ┌───▼──────────────┐
                        │ ORDER            │
                        │                  │
                        │ _id              │
                        │ cropId     ──────┼→ CROP
                        │ farmerId   ──────┼→ FARMER
                        │ traderId   ──────┼→ TRADER
                        │ quantity         │
                        │ unit             │
                        │ totalPrice       │
                        │ transportId      │
                        │ orderStatus      │
                        │ deliveryAddress  │
                        └──────────────────┘
```

---

## Weight Slab Matching Algorithm

```
┌─────────────────────────────────────────────────┐
│     WEIGHT SLAB MATCHING ALGORITHM              │
└─────────────────────────────────────────────────┘

INPUT: Order with Crop Quantity
   │
   ├─ Example: 5 quintals of wheat
   │
   ▼
CONVERT TO STANDARD UNIT (kg)
   │
   ├─ 5 quintals × 100 = 500 kg
   │
   ▼
QUERY DATABASE
   │
   ├─ Find TransporterVehicles WHERE:
   │   • transporterId = currentUser._id
   │   • isActive = true
   │   • weightSlab.minWeight ≤ 500
   │   • weightSlab.maxWeight ≥ 500
   │
   ▼
MATCHING LOGIC
   │
   ├─ Vehicle A: minWeight=100, maxWeight=1000
   │   ├─ 100 ≤ 500 ✓
   │   ├─ 1000 ≥ 500 ✓
   │   └─ MATCH ✓
   │
   ├─ Vehicle B: minWeight=1000, maxWeight=2000
   │   ├─ 1000 ≤ 500 ✗
   │   └─ NO MATCH ✗
   │
   ├─ Vehicle C: minWeight=50, maxWeight=200
   │   ├─ 200 ≥ 500 ✗
   │   └─ NO MATCH ✗
   │
   ▼
OUTPUT: Suggested Vehicles
   │
   └─ Display matched vehicles
      └─ Transporter selects one
         └─ Accept order
```

---

## API Request/Response Flow

```
┌────────────────────────────────────────────────────────┐
│        API REQUEST/RESPONSE FLOW                       │
└────────────────────────────────────────────────────────┘

REQUEST: GET /api/vehicles/suggest/654f3e2b8c1a2d3e4f5g6h

┌──────────────────────────────┐
│ Frontend (AvailableOrders)   │
│  - Sends: orderId            │
│  - Headers: Authorization    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend Express Server       │
│  - Receives request          │
│  - Validates auth token      │
│  - Extracts orderId          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ vehicleManagement            │
│ Controller                   │
│ (suggestVehiclesForOrder)    │
│  - Find order by ID          │
│  - Get crop quantity/unit    │
│  - Convert to kg             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ TransporterVehicle Model     │
│ (MongoDB Query)              │
│  - Find with weight matching │
│  - Return matched vehicles   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Response Sent to Frontend    │
│ {                            │
│   success: true,             │
│   orderQuantity: 500,        │
│   suggestedVehicles: [...]   │
│ }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend Display             │
│ - Render vehicle options     │
│ - Allow selection            │
│ - Enable acceptance          │
└──────────────────────────────┘
```

---

## Database Schema - TransporterVehicle

```
TransporterVehicle Collection
│
├─ _id: ObjectId
│
├─ transporterId: ObjectId (ref: User)
│
├─ vehicleName: String
│  └─ Example: "Tempo Blue"
│
├─ vehicleNumber: String (unique)
│  └─ Example: "MH01AB1234"
│
├─ vehicleType: String (enum)
│  ├─ "Bike"
│  ├─ "Auto"
│  ├─ "Tempo"
│  ├─ "Truck"
│  ├─ "Mini Truck"
│  └─ "Other"
│
├─ weightSlab: Object ◄─── CORE FEATURE
│  ├─ minWeight: Number (1-100000)
│  ├─ maxWeight: Number (1-100000)
│  └─ unit: String (enum: "kg", "quintal", "ton")
│
├─ loadCapacity: Number
│  └─ Physical load capacity
│
├─ loadCapacityUnit: String
│  └─ Measurement unit for load
│
├─ baseFare: Number
│  └─ Fixed base transportation fee
│
├─ farePerKm: Number
│  └─ Per kilometer charge
│
├─ registrationCertificate: String
│  └─ Reference/URL to document
│
├─ insuranceCertificate: String
│  └─ Reference/URL to document
│
├─ pollutionCertificate: String
│  └─ Reference/URL to document
│
├─ isActive: Boolean
│  ├─ true: Vehicle is active
│  └─ false: Vehicle is disabled
│
├─ availabilityStatus: String (enum)
│  ├─ "available": Can accept orders
│  ├─ "on_delivery": Currently transporting
│  ├─ "maintenance": Temporarily unavailable
│  └─ "inactive": Disabled
│
├─ lastMaintenanceDate: Date
│  └─ When last serviced
│
├─ nextMaintenanceDate: Date
│  └─ When next service due
│
├─ notes: String
│  └─ Additional information
│
├─ createdAt: Date
│  └─ When record created
│
└─ updatedAt: Date
   └─ When last updated

INDEXES:
├─ transporterId: 1
├─ vehicleNumber: 1
├─ transporterId: 1, isActive: 1
└─ weightSlab.minWeight: 1, weightSlab.maxWeight: 1
```

---

## Status State Machines

### Order Status Transitions

```
Pending
   │
   ├──► Farmer Agreed
   │       │
   │       └──► Both Agreed
   │               │
   │               └──► Awaiting Advance
   │                       │
   │                       └──► Advance Paid
   │                               │
   │                               └──► Ready for Pickup ◄─── TRANSPORTER SEES HERE
   │                                       │
   │                                       └──► In Transit
   │                                               │
   │                                               └──► Delivered
   │                                                       │
   │                                                       └──► Completed
   │
   └──► Rejected
   └──► Cancelled
```

### Vehicle Availability States

```
Created as Available
   │
   ├─ Available ◄─────────┐
   │      │               │ Can toggle between
   │      └─► Maintenance ┤ these two states
   │              │       │
   │              └───────┘
   │
   ├─ On Delivery (auto)
   │      │
   │      └─► Available (after completion)
   │
   └─ Inactive (disabled)
          │
          └─► Available (re-enable)
```

---

## Feature Integration Points

```
┌──────────────────────────────────────────────────┐
│          SYSTEM INTEGRATION POINTS               │
└──────────────────────────────────────────────────┘

1. FARMER <─► TRADER
   ├─ Farmer creates Crop
   ├─ Trader places Order
   ├─ Farmer signs Agreement
   └─ Trader signs Agreement
      └─ ORDER STATUS: "Ready for Pickup"

2. TRADER <─► TRANSPORTER
   ├─ Order becomes available
   ├─ Transporter sees order
   ├─ Transporter selects vehicle
   └─ Transporter accepts order
      └─ TRANSPORT RECORD CREATED

3. TRANSPORTER <─► FARMER/TRADER
   ├─ Update delivery status
   ├─ Pick up from farmer location
   ├─ Deliver to trader location
   └─ Complete delivery
      └─ ORDER STATUS: "Completed"

4. FARMER <─► TRANSPORTER
   ├─ Know who's transporting
   ├─ Track delivery status
   ├─ Confirm delivery
   └─ Rate transporter

5. TRADER <─► TRANSPORTER
   ├─ Know who's delivering
   ├─ Track delivery status
   ├─ Confirm receipt
   └─ Rate transporter
```

---

## Error Handling Flow

```
┌────────────────────────────────────┐
│      ERROR HANDLING FLOW           │
└────────────────────────────────────┘

USER ACTION
    │
    ▼
VALIDATION CHECK
    │
    ├─ Valid? ──► Continue
    │
    └─ Invalid?
        │
        ▼
    VALIDATION ERROR
        │
        └─► Return 400 Bad Request
            ├─ Show error message
            └─ Highlight invalid field

API REQUEST
    │
    ├─ Auth valid? ──► Continue
    │
    └─ Auth invalid?
        │
        ▼
    AUTH ERROR
        │
        └─► Return 401 Unauthorized
            └─ Redirect to login

DATABASE OPERATION
    │
    ├─ Success? ──► Return data
    │
    └─ Failure?
        │
        ▼
    DATABASE ERROR
        │
        └─► Return 500 Server Error
            ├─ Log error
            └─ Show user-friendly message

NO MATCHING VEHICLES
    │
    ▼
EMPTY RESULT
    │
    └─► Return 200 with empty array
        ├─ Show helpful message
        └─ Suggest adding vehicle
```

---

## Summary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM                      │
└─────────────────────────────────────────────────────────┘

AGREEMENT COMPLETION
         │
         ▼
ORDER BECOMES AVAILABLE
         │
         ├─ Weight: 500 kg
         ├─ Crop: Rice
         └─ Location: Farm to Warehouse
         │
         ▼
TRANSPORTER VIEWS ORDERS
         │
         ├─ Go to Available Orders
         ├─ Browse list
         └─ Select order
         │
         ▼
WEIGHT ANALYSIS & MATCHING
         │
         ├─ Convert: 5 quintals = 500 kg
         ├─ Query vehicles
         └─ Find weight slab match
         │
         ▼
VEHICLE SUGGESTION
         │
         ├─ Show vehicles: 100-1000 kg capacity
         ├─ Hide vehicles: 1000+ kg (too large)
         └─ Hide vehicles: <100 kg (too small)
         │
         ▼
TRANSPORTER SELECTION
         │
         ├─ Select matched vehicle
         └─ Review details
         │
         ▼
ORDER ACCEPTANCE
         │
         ├─ Click "Accept"
         ├─ Create Transport record
         └─ Update Order status
         │
         ▼
DELIVERY MANAGEMENT
         │
         ├─ View in Active Deliveries
         ├─ Update: Assigned → Picked Up → In Transit → Delivered
         └─ Complete order
         │
         ▼
ORDER COMPLETED
```

---

**This architecture ensures:**
✅ Efficient weight-based matching
✅ Proper separation of concerns
✅ Scalable design
✅ Clear data flow
✅ Error handling
✅ Security & validation
