const roleSkillMap = {

  auto_driver: [
    "driving",
    "navigation",
    "local_transport",
  ],

  cab_driver: [
    "driving",
    "navigation",
    "customer_handling",
  ],

  lorry_driver: [
    "heavy_vehicle_driving",
    "navigation",
    "goods_transport",
    "long_distance_driving",
  ],

  delivery_rider: [
    "driving",
    "parcel_delivery",
    "navigation",
  ],

  mason: [
    "brickwork",
    "cement_work",
    "construction",
  ],

  painter: [
    "wall_painting",
    "surface_finishing",
  ],

  welder: [
    "welding",
    "metal_work",
  ],

  cleaner: [
    "cleaning",
    "housekeeping",
  ],

  maid: [
    "housekeeping",
    "cooking",
    "cleaning",
  ],
};

module.exports = {
  roleSkillMap,
};