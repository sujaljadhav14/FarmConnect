# Transport Vehicle Management - Setup & Usage Guide

## Quick Setup

### 1. Backend Setup

#### Import Model in Server
The TransporterVehicle model is already created at:
```
backend/models/TransporterVehicle.js
```

#### Routes Already Added
In `backend/server.js`, the following is already configured:
```javascript
import vehicleManagementRoutes from "./routes/vehicleManagementRoutes.js";
app.use("/api/vehicles", vehicleManagementRoutes);
```

#### Create Collections
MongoDB will automatically create the collections when first document is inserted.

### 2. Frontend Setup

#### Routes Added to App.js
```javascript
// Transport Pages - All routes added
<Route path="/transport/vehicles" element={<VehicleManagement />} />
<Route path="/transport/vehicles/add" element={<AddVehicle />} />
<Route path="/transport/available-orders" element={<AvailableOrders />} />
```

#### Navigation Updated
TransportDashboard now includes "Available Orders" and "Vehicle Management" cards.

---

## How to Use

### For Transporter Users

#### 1. Adding a Vehicle

**Navigation Path**:
```
Transport Dashboard 
  → Vehicle Management 
    → Add New Vehicle
```

**Form Fields to Fill**:

| Section | Fields | Example |
|---------|--------|---------|
| **Basic Info** | Vehicle Name, Number, Type, Year | "Tempo White", "MH01AB1234", "Tempo", 2020 |
| **Weight Category** | Min Weight, Max Weight, Unit | 100, 1000, "kg" |
| **Capacity** | Load Capacity, Unit | 1000, "kg" |
| **Pricing** | Base Fare, Per KM Fare | 500, 10 |
| **Certificates** | Registration, Insurance, PUC | Optional references |

**Weight Slab Guidance**:
- **100-500 kg**: Small Tempo or Auto vehicles
- **500-1500 kg**: Standard Truck or large Tempo
- **1500-5000 kg**: Heavy Truck
- **5000+ kg**: Multi-axle heavy vehicles

#### 2. Managing Vehicles

**View All Vehicles**:
```
Transport Dashboard → Vehicle Management
```

Shows:
- Vehicle name and registration
- Weight capacity range
- Load capacity
- Pricing details
- Status (Available/Maintenance)
- Action buttons (Edit, Delete, Toggle Status)

**Edit Vehicle**:
1. Click "Edit" button on vehicle card
2. Update details
3. Save changes

**Delete Vehicle**:
1. Click "Delete" button
2. Confirm in modal
3. Vehicle is removed

**Toggle Availability**:
- Click "Mark Maintenance" to disable temporarily
- Click "Mark Available" to re-enable

#### 3. Accepting Orders

**Navigation Path**:
```
Transport Dashboard 
  → Available Orders
```

**Order Selection Flow**:

1. **Browse Orders** (Left Panel)
   - See all available orders from completed trader agreements
   - Shows: Crop name, quantity, price, delivery location, date
   - Click to select

2. **View Suggestions** (Right Panel)
   - System automatically suggests vehicles
   - Only vehicles matching order weight are shown
   - Based on weight slab matching

3. **Select Vehicle**
   - Click on vehicle card to select
   - Shows: Weight capacity, pricing, registration

4. **Accept Order**
   - Click "Accept Order & Proceed"
   - Order assigned to your vehicle
   - Moves to Active Deliveries

**Example**: 
- Order has 500 kg crop
- Vehicles with weight slab 100-1000 kg ✅ suggested
- Vehicles with weight slab 1000-2000 kg ❌ not suggested
- Vehicles with weight slab 50-200 kg ❌ not suggested

#### 4. Managing Deliveries

**View Active Deliveries**:
```
Transport Dashboard 
  → Active Deliveries
```

**Update Delivery Status**:
1. Assigned → Picked Up (at farm)
2. Picked Up → In Transit (on the way)
3. In Transit → Delivered (at destination)

---

## Weight Conversion Reference

When order is in different units, system automatically converts:

| Input Unit | Conversion | In KG |
|-----------|-----------|-------|
| 1 kg | × 1 | 1 kg |
| 1 quintal | × 100 | 100 kg |
| 1 ton | × 1000 | 1000 kg |

**Example**: 
- Order: 5 quintals of rice
- Conversion: 5 × 100 = 500 kg
- Suggested vehicles: Those with 500 kg within their weight slab

---

## Status & Availability Guide

### Vehicle Availability States

| Status | What It Means | Can Accept Orders |
|--------|--------------|------------------|
| 🟢 Available | Ready to work | Yes |
| 🟡 Maintenance | Temporarily unavailable | No |
| 🔴 Inactive | Disabled | No |
| 🟠 On Delivery | Currently transporting | No (auto-managed) |

### Order Status States

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| Ready for Pickup | Available for transport | Select & Accept |
| In Transit | Being transported | Update status when delivered |
| Delivered | Completed | View in history |

---

## Common Scenarios

### Scenario 1: Adding Multiple Vehicles

```
Vehicle 1: Tempo (100-1000 kg) - For small orders
Vehicle 2: Truck (1000-5000 kg) - For large orders
Vehicle 3: Mini Truck (500-2000 kg) - Flexible option
```

Benefits:
- Auto-suggestion picks best match
- Flexibility to accept varied orders
- Better utilization rates

### Scenario 2: Seasonal Availability

```
Summer: Mark all vehicles available
Monsoon: Mark vehicles in poor condition as maintenance
Winter: All vehicles available
```

### Scenario 3: Order Acceptance Workflow

```
Day 1:
  → Trader completes agreement with farmer
  → Order shows as "Ready for Pickup"

Your Action:
  → Go to Available Orders
  → Select order (500 kg)
  → System suggests vehicles with 500 kg capacity
  → Accept with best vehicle

Delivery:
  → Update status: Assigned → Picked Up → In Transit → Delivered
```

---

## Error Messages & Solutions

| Message | Problem | Solution |
|---------|---------|----------|
| "No suitable vehicles found" | No vehicle matches order weight | Add vehicle with appropriate weight slab |
| "Maximum weight must be greater than minimum" | Form validation error | Ensure max > min (e.g., 100 > 50) |
| "Vehicle number already exists" | Duplicate vehicle number | Use different registration plate |
| "Order already assigned" | Another transporter took it | Refresh page and select different order |
| "Weight slab required" | Missing weight info | Fill both min and max weight |

---

## Tips & Best Practices

### 1. Weight Slab Selection
- Set realistic ranges based on vehicle capacity
- Add 10-20% buffer to maximum weight
- Don't set too narrow ranges (e.g., 500-510) - won't match many orders

### 2. Pricing Strategy
- Base Fare: Fixed cost per trip
- Per KM: Based on distance
- Example: 500 + (10 × 50 km) = ₹1000 for 50 km trip

### 3. Vehicle Management
- Add certificates for better credibility
- Update availability before holidays/break
- Maintain maintenance records

### 4. Order Selection
- Prioritize orders with:
  - Nearby delivery locations
  - Suitable payment terms
  - Appropriate weight for your vehicle
- Check delivery dates carefully

---

## Feature Highlights

✅ **Automatic Suggestion**: Only suitable vehicles shown for each order
✅ **Weight Categories**: Organize vehicles by capacity
✅ **Real-time Matching**: Instant suggestions based on order weight
✅ **Flexible Management**: Edit, delete, toggle vehicles anytime
✅ **Status Tracking**: Complete visibility of all deliveries
✅ **Responsive UI**: Works on desktop and mobile

---

## Troubleshooting

### Vehicle Not Appearing in Suggestions

**Check**:
1. Is the vehicle active? (Toggle "Mark Available")
2. Does order weight fall within weight slab?
   - Order: 600 kg
   - Vehicle: 100-500 kg range → Won't suggest ❌
   - Vehicle: 100-1000 kg range → Will suggest ✅
3. Is the vehicle marked as "Available"?

### Order Not Accepting

**Check**:
1. Is vehicle selected?
2. Is vehicle status "Available"?
3. Are you logged in as transporter?
4. Has agreement between farmer and trader completed?

### Calculation Incorrect

**Verify**:
- Order quantity: 1 quintal
- Your assumption: 100 kg
- Verification: 1 quintal = 100 kg ✅
- Vehicle range: 50-200 kg → Will suggest

---

## Video Tutorial Checklist

- [ ] Navigate to Vehicle Management
- [ ] Add new vehicle with weight slab
- [ ] Edit vehicle details
- [ ] Delete vehicle
- [ ] View available orders
- [ ] Select order and see suggestions
- [ ] Accept order
- [ ] Check active deliveries
- [ ] Update delivery status

---

## Support & Help

For issues or questions:
1. Check "Support & Help" in Transport Dashboard
2. Review this guide
3. Check error messages for specific solutions
4. Contact system administrator if needed

---

## Key Points Summary

- 🎯 **Weight Slab**: Core feature for vehicle-order matching
- 📦 **Available Orders**: Only orders with completed agreements
- 🚚 **Auto-Suggestion**: System finds best matching vehicles
- ✅ **Easy Management**: Add, edit, delete vehicles anytime
- 📍 **Status Tracking**: Know where each delivery is

**Happy Transporting!** 🚚✨
