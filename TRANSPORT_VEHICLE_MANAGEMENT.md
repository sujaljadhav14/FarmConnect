# Transport Order Management & Vehicle Management System

## Overview

This document describes the implementation of a comprehensive transport order management system with vehicle management based on weight slabs. The system allows:

1. **For Traders**: Complete trade agreements with farmers that make orders available for transport
2. **For Transporters**: 
   - Add vehicles with specific weight capacity ranges (slabs)
   - View available orders from completed agreements
   - Get AI-suggested vehicles based on order weight
   - Accept orders and manage deliveries

---

## System Architecture

### Database Schema

#### 1. TransporterVehicle Model (`backend/models/TransporterVehicle.js`)

```javascript
{
  transporterId: ObjectId,        // Reference to transporter user
  vehicleName: String,            // e.g., "Tempo Blue"
  vehicleNumber: String,          // Registration plate (unique)
  vehicleType: String,            // Bike, Auto, Tempo, Truck, Mini Truck, Other
  
  // Weight Slab - Core Feature
  weightSlab: {
    minWeight: Number,            // Minimum capacity
    maxWeight: Number,            // Maximum capacity
    unit: String,                 // kg, quintal, ton
  },
  
  // Capacity
  loadCapacity: Number,
  loadCapacityUnit: String,
  
  // Pricing
  baseFare: Number,               // Fixed base fare
  farePerKm: Number,              // Per kilometer charge
  
  // Documents
  registrationCertificate: String,
  insuranceCertificate: String,
  pollutionCertificate: String,
  
  // Availability
  isActive: Boolean,
  availabilityStatus: String,     // available, on_delivery, maintenance, inactive
  
  // Maintenance
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  
  notes: String,
  timestamps: true
}
```

#### 2. Enhanced Order Model

Orders now include:
- `orderStatus: "Ready for Pickup"` - When agreement is completed and order is ready
- `quantity` and `unit` fields for weight calculation
- `transportId` field for assignment

---

## API Endpoints

### Vehicle Management Endpoints

#### 1. Add Vehicle
```
POST /api/vehicles/add
Authorization: Bearer {token}

Request Body:
{
  vehicleName: "Tempo White",
  vehicleNumber: "MH01AB1234",
  vehicleType: "Tempo",
  minWeight: 100,              // kg
  maxWeight: 1000,             // kg
  weightUnit: "kg",
  yearOfManufacture: 2020,
  loadCapacity: 1000,
  loadCapacityUnit: "kg",
  baseFare: 500,
  farePerKm: 10,
  registrationCertificate: "Ref123",
  insuranceCertificate: "Ins123",
  pollutionCertificate: "PUC123",
  notes: "Best for vegetable transport"
}

Response:
{
  success: true,
  message: "Vehicle added successfully",
  vehicle: { ... }
}
```

#### 2. Get My Vehicles
```
GET /api/vehicles/my-vehicles
Authorization: Bearer {token}

Response:
{
  success: true,
  count: 3,
  vehicles: [ { ... }, { ... } ]
}
```

#### 3. Get Vehicle By ID
```
GET /api/vehicles/{vehicleId}
Authorization: Bearer {token}
```

#### 4. Update Vehicle
```
PUT /api/vehicles/{vehicleId}/update
Authorization: Bearer {token}

Request Body: (any fields to update)
{
  vehicleName: "Updated Name",
  minWeight: 150,
  maxWeight: 1200,
  ...
}
```

#### 5. Delete Vehicle
```
DELETE /api/vehicles/{vehicleId}/delete
Authorization: Bearer {token}
```

#### 6. Update Vehicle Availability
```
PUT /api/vehicles/{vehicleId}/availability
Authorization: Bearer {token}

Request Body:
{
  availabilityStatus: "available" | "on_delivery" | "maintenance" | "inactive"
}
```

### Order & Matching Endpoints

#### 1. Get Available Orders
```
GET /api/vehicles/orders/available
Authorization: Bearer {token}

Response:
{
  success: true,
  count: 5,
  orders: [
    {
      _id: "...",
      cropId: { cropName, quantity, unit },
      farmerId: { name, phone, location },
      traderId: { name, phone, location },
      deliveryAddress: "...",
      totalPrice: 50000,
      expectedDeliveryDate: "...",
      ...
    }
  ]
}
```

#### 2. Suggest Vehicles for Order
```
GET /api/vehicles/suggest/{orderId}
Authorization: Bearer {token}

Response:
{
  success: true,
  orderQuantity: 500,           // Converted to kg
  quantityUnit: "kg",
  suggestedVehicles: [
    {
      _id: "...",
      vehicleName: "...",
      vehicleType: "...",
      weightSlab: { minWeight, maxWeight, unit },
      loadCapacity: 1000,
      baseFare: 500,
      farePerKm: 10,
      ...
    }
  ],
  count: 3
}
```

#### 3. Get Vehicles By Weight Range
```
GET /api/vehicles/weight-range/filter?minWeight=100&maxWeight=1000
Authorization: Bearer {token}
```

---

## Frontend Components

### 1. VehicleManagement.js (`frontend/src/pages/transport/VehicleManagement.js`)

**Purpose**: Display all vehicles owned by a transporter with management options

**Features**:
- List all vehicles in card format
- Edit vehicle details
- Delete vehicles
- Toggle availability status
- Add new vehicles button
- Empty state handling

**Key Functions**:
- `fetchVehicles()` - Load all vehicles
- `handleDeleteClick()` - Confirm deletion
- `confirmDelete()` - Execute deletion
- `toggleAvailability()` - Change status

### 2. AddVehicle.js (`frontend/src/pages/transport/AddVehicle.js`)

**Purpose**: Form to add or edit a vehicle

**Features**:
- Basic Information Section (name, number, type, year)
- **Weight Slab Section** (min weight, max weight, unit)
- Capacity Details
- Pricing Information
- Certifications
- Form validation
- Success/error messages

**Key Validation**:
```javascript
// Weight slab validation
if (maxWeight <= minWeight) {
  setError("Maximum weight must be greater than minimum weight");
}
```

### 3. AvailableOrders.js (`frontend/src/pages/transport/AvailableOrders.js`)

**Purpose**: Show available orders and help transporter select and accept orders

**Features**:
- Left Panel: List of available orders
  - Shows crop name, quantity, price, delivery location, date
  - Order selection highlighting
  
- Right Panel: Order details & Vehicle suggestion
  - Selected order summary
  - Loading suggested vehicles
  - List of suitable vehicles based on weight
  - Accept order button with selected vehicle

**Weight Conversion Logic**:
```javascript
const convertWeightToKg = (quantity, unit) => {
  switch (unit) {
    case "quintal":
      return quantity * 100;
    case "ton":
      return quantity * 1000;
    default:
      return quantity;  // Already in kg
  }
};
```

**Vehicle Selection Flow**:
1. Transporter clicks on an order
2. System converts order quantity to kg
3. API suggests all vehicles whose weight slab matches
4. Transporter selects preferred vehicle
5. Clicks "Accept Order & Proceed"

---

## Weight Slab Matching Algorithm

### How It Works

When a transporter selects an order, the system:

1. **Extracts order weight**:
   ```javascript
   // Convert all quantities to kg
   const quantityInKg = convertWeightToKg(quantity, unit);
   ```

2. **Finds matching vehicles**:
   ```javascript
   const suggestedVehicles = await TransporterVehicle.find({
     transporterId,
     isActive: true,
     "weightSlab.minWeight": { $lte: quantityInKg },      // Min weight ≤ order weight
     "weightSlab.maxWeight": { $gte: quantityInKg }       // Max weight ≥ order weight
   });
   ```

3. **Returns sorted results**:
   - Vehicles are sorted by creation date (newest first)
   - Empty results show error with suggestion to add vehicle

### Example Scenarios

**Scenario 1**: Order with 500 kg weight
- Vehicle A: 100-1000 kg ✅ (suggested)
- Vehicle B: 50-200 kg ❌ (too small)
- Vehicle C: 1000-2000 kg ❌ (too large)

**Scenario 2**: Order with 1 quintal (100 kg) weight
- System converts: 1 quintal = 100 kg
- Vehicle with 50-200 kg ✅ (suggested)

---

## User Workflow

### For Transporter

#### Step 1: Add Vehicles
1. Go to **Transport Dashboard**
2. Click **Vehicle Management**
3. Click **Add New Vehicle**
4. Fill form:
   - Vehicle details (name, number, type)
   - **Weight Slab**: Set min 100 kg, max 1000 kg
   - Capacity, pricing, certificates
5. Submit

#### Step 2: View Available Orders
1. From Dashboard click **Available Orders**
2. See list of all ready orders from traders

#### Step 3: Accept Order
1. Click on an order in the list
2. View order details (weight, price, location)
3. See suggested vehicles matching the weight
4. Select preferred vehicle
5. Click **Accept Order & Proceed**
6. Order moves to Active Deliveries

#### Step 4: Manage Deliveries
1. Go to **Active Deliveries**
2. Update status: Assigned → Picked Up → In Transit → Delivered
3. Complete delivery

---

## Database Relationships

```
User (Transporter)
  ├── TransporterVehicle (1:Many)
  │   ├── weightSlab (weight category)
  │   └── availability status
  │
  └── Transport (Deliveries)
      └── Order (Completed with agreement)
          ├── Crop
          ├── Farmer User
          └── Trader User
```

---

## Key Features & Logic

### 1. Weight Slab Validation
- Min weight must be less than max weight
- Both required for vehicle creation
- Units must be consistent (kg, quintal, ton)

### 2. Order Availability
- Orders show as "Ready for Pickup" only after:
  - Agreement is completed between farmer and trader
  - Order status transitions correctly

### 3. Automatic Suggestions
- Real-time matching based on current vehicle inventory
- Prevents manual selection of unsuitable vehicles
- Shows "No suitable vehicles" if none match

### 4. Availability Management
- Vehicles can be marked as:
  - **Available**: Can accept orders
  - **Maintenance**: Temporarily unavailable
  - **Inactive**: Disabled
  - **On Delivery**: Currently transporting

---

## Status Enums

### Order Status Flow
```
Pending 
  → Farmer Agreed 
    → Both Agreed 
      → Awaiting Advance 
        → Advance Paid 
          → Ready for Pickup  ← AVAILABLE FOR TRANSPORT
            → In Transit (when transporter accepts)
              → Delivered
```

### Vehicle Availability Status
```
available       ← Can be assigned orders
on_delivery     ← Currently transporting
maintenance     ← Temporarily unavailable
inactive        ← Disabled, cannot be used
```

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No suitable vehicles found" | Weight slab doesn't match | Add vehicle with appropriate weight range |
| "Order not found" | Invalid order ID | Select from available orders list |
| "Maximum weight must be greater than minimum" | Form validation failed | Ensure maxWeight > minWeight |
| "Vehicle number already exists" | Duplicate registration | Use unique vehicle number |
| "Order already assigned" | Another transporter took it | Refresh and select different order |

---

## Frontend Styling

### CSS Files
- `VehicleManagement.css` - Vehicle list and card styling
- `AvailableOrders.css` - Order selection UI

### Design Features
- Responsive grid layout
- Color-coded status badges
- Hover effects for selection
- Loading states with spinners
- Empty state illustrations
- Success/error notifications

---

## Backend Routes Configuration

Added to `server.js`:
```javascript
import vehicleManagementRoutes from "./routes/vehicleManagementRoutes.js";
app.use("/api/vehicles", vehicleManagementRoutes);
```

---

## Testing Checklist

- [ ] Add vehicle with weight slab
- [ ] View all vehicles in list
- [ ] Edit vehicle details
- [ ] Delete vehicle
- [ ] Toggle vehicle availability
- [ ] View available orders
- [ ] Select order and get vehicle suggestions
- [ ] Accept order with selected vehicle
- [ ] Verify order appears in active deliveries
- [ ] Test weight conversion (kg, quintal, ton)
- [ ] Verify form validation
- [ ] Test error messages

---

## Future Enhancements

1. **Advanced Filtering**
   - Filter vehicles by type, availability
   - Filter orders by location, price range

2. **Performance Optimization**
   - Pagination for large vehicle lists
   - Caching vehicle suggestions

3. **Analytics**
   - Transporter earnings dashboard
   - Vehicle utilization reports
   - Order acceptance rate

4. **Smart Matching**
   - ML-based vehicle suggestions considering distance
   - Fuel efficiency optimization
   - Cost-effectiveness scoring

5. **Integration Features**
   - GPS tracking during delivery
   - Real-time notifications
   - Payment integration

---

## Summary

This system creates a seamless flow:
1. **Traders** complete agreements with farmers → Orders become available
2. **Transporters** add vehicles with weight slabs → Automatically suggested for matching orders
3. **Smart Matching** prevents wrong vehicle selection → Improves efficiency
4. **Status Tracking** keeps all parties informed → Better coordination

The weight slab feature ensures that only appropriate vehicles are suggested for orders, improving reliability and customer satisfaction.
