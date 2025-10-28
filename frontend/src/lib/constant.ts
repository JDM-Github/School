
export const specs = {
    Processor: "Raspberry Pi 4 Model B (Quad-core Cortex-A72, 1.5GHz)",
    RAM: "8GB LPDDR4",
    Storage: "32GB microSD",

    Camera: "Raspberry Pi Camera Module 3",
    Still_Resolution: "11.9 megapixels",
    Video_Modes: "2304 × 1296p56, 2304 × 1296p30 HDR, 1536 × 864p120",
    Sensor_Resolution: "4608 × 2592 pixels",
    Sensor_Image_Area: "6.45 × 3.63mm (7.4mm diagonal)",
    Horizontal_FoV: "66 degrees",
    Vertical_FoV: "41 degrees",
    Frame_Rate: "30 FPS",

    Object_Detection_Model: "YOLOv8 (for detecting objects like plants)",
    Stage_Classification_Model: "YOLOv8 (for classifying plant health stages)",
    Segmentation_Model:
        "Mask R-CNN (for segmenting areas like leaves or disease regions)",
    Detection_Accuracy: {
        YOLO_Object_Detection: "90-95%",
        YOLO_Stage_Classification: "85-92%",
        Mask_RCNN_Segmentation: "87-94%",
    },
    Max_Object_Detection_Range: "1 meter",

    Number_of_Sprayers: 4,
    Spray_Precision: "Adaptive (based on AI detection)",
    Spray_Activation_Method: "Relay-controlled via Raspberry Pi",

    Wireless_Connectivity: "Wi-Fi (2.4GHz & 5GHz)",
    Edge_Processing: "Runs AI models on-device (no cloud needed)",
    Heat_Resistance:
        "Up to 80°C (suitable for moderate outdoor and indoor conditions)",
    Water_Resistance: "IP65 (with proper enclosure)",
    Material: "PETG",
};

export const materials = [
    "Raspberry Pi 4",
    "Raspberry Pi Camera Module 3",
    "4 Module Relay",
    "18650 Lithium Battery (5000mAH pack)",
    "Flex Cable CSI 15 Pin Ribbon",
    "MG996R Servo (180 Rotation)",
    "High Quality Soft Silicon Flexi Flexible Multicore Wire Cable",
    "Silicone Hose Tubing",
    "Dupont Wire Female Terminal Connector",
    "Extended Copper Hex Coupling Motor Shaft",
    "Insulated Ferrule Crimp",
    "Sandisk Ultra MicroSDXC UHS-I card (32gb)",
    "Aluminum 25T Servo Arm Horn",
    "Misting Nozzle (6mm)",
    "JGA25-370 DC Geared Motor",
    "Double BTS7960 43A H-Bridge",
    "365 12V DC Pumping Motor",
    "CP2102 USB to TTL/Serial Module UART",
    "PCF8574 IO Expansion GPIO Port Expander Module",
    "TCRT5000 infrared reflection sensor",
    "XL4015 Constant Voltage Step Down Buck Converter",
    "Bridge Design Zero Line Screw Brass Copper 12 Terminal Block",
    "TCS34725 RGB Sensor",
    "Ultrasonic HC-SR04 sensor",
    "Water Sensors"
];

export const materialLinks = {
    "Raspberry Pi 4": {
        desc: "A small single-board computer for robotics and IoT projects.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938186/Raspberry-Pi4_b6shbu.png",
    },
    "Raspberry Pi Camera Module 3": {
        desc: "High-quality camera module for Raspberry Pi with autofocus.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938336/Raspberry-Pi-Camera-3_sajwps.png",
    },
    "4 Module Relay": {
        desc: "Relay board for controlling high-voltage devices with low-voltage logic.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938374/84ecd958-0b1a-4d1f-af75-0f086eed5125_vnzmph.png",
    },
    "18650 Lithium Battery (5000mAH pack)": {
        desc: "Rechargeable lithium-ion battery pack for portable power.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938564/bat_ryeeve.png",
    },
    "Flex Cable CSI 15 Pin Ribbon": {
        desc: "Flexible ribbon cable used to connect Raspberry Pi cameras.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938624/cab_quo8c4.png",
    },
    "MG996R Servo (180 Rotation)": {
        desc: "High-torque metal gear servo motor, 180° rotation.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938695/servo_znhm5q.png",
    },
    "High Quality Soft Silicon Flexi Flexible Multicore Wire Cable": {
        desc: "Flexible silicon-coated wires for electronics and robotics.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938804/wire_zg93jf.png",
    },
    "Silicone Hose Tubing": {
        desc: "Flexible silicone hose used for fluid transfer or pneumatics.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938819/tube_hqdv5w.png",
    },
    "Dupont Wire Female Terminal Connector": {
        desc: "Jumper wire connectors for breadboards and microcontrollers.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938875/dup_dxxkwp.png",
    },
    "Extended Copper Hex Coupling Motor Shaft": {
        desc: "Copper coupling for connecting motor shafts.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757938964/shaft_rgyvfm.png",
    },
    "Insulated Ferrule Crimp": {
        desc: "Ferrule terminals used for clean wire connections.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939042/fer_vtvhsx.png",
    },
    "Sandisk Ultra MicroSDXC UHS-I card (32gb)": {
        desc: "High-speed microSD card for data storage.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939075/sd_l5sirn.png",
    },
    "Aluminum 25T Servo Arm Horn": {
        desc: "Aluminum horn attachment for servo motors.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939124/mt_opkkcy.png",
    },
    "Misting Nozzle (6mm)": {
        desc: "Nozzle used for spraying fine mist in cooling or irrigation.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939258/mist_ju5qd8.png",
    },
    "JGA25-370 DC Geared Motor": {
        desc: "High-torque geared DC motor, widely used in robotics.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939339/jga_xyrten.png",
    },
    "Double BTS7960 43A H-Bridge": {
        desc: "High-current motor driver module.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939449/bts_pnaxss.png",
    },
    "365 12V DC Pumping Motor": {
        desc: "DC motor used for pumping applications.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939473/pump_m5pdrp.png",
    },
    "CP2102 USB to TTL/Serial Module UART": {
        desc: "USB to serial communication adapter.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939551/ua_ornis4.png",
    },
    "PCF8574 IO Expansion GPIO Port Expander Module": {
        desc: "I2C GPIO expander for microcontrollers.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939589/pcf_quglmv.png",
    },
    "TCRT5000 infrared reflection sensor": {
        desc: "Infrared sensor used for object detection and line following.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939610/tc_rifrbi.png",
    },
    "XL4015 Constant Voltage Step Down Buck Converter": {
        desc: "Adjustable DC-DC step-down voltage regulator.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939710/15_pdxrgl.png",
    },
    "Bridge Design Zero Line Screw Brass Copper 12 Terminal Block": {
        desc: "Terminal block for wire connections.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939779/tb_re6qgh.png",
    },
    "TCS34725 RGB Sensor": {
        desc: "Color sensor for detecting RGB values.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939832/tcs_mgpi3u.png",
    },
    "Ultrasonic HC-SR04 sensor": {
        desc: "Ultrasonic sensor for distance measurement.",
        img: "https://res.cloudinary.com/dy6z8wadm/image/upload/v1757939843/ul_odanjq.png",
    },
    "Water Sensors": {
        desc: "",
        img: ""
    }
};
