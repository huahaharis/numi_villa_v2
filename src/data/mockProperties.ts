export interface Property {
    id: string;
    title: string;
    location: string;
    description: string;
    price: number;
    beds: number;
    baths: number;
    sqft?: number | string;
    image: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    amenities: string[];
    googleMapsUrl?: string;
}

export const mockProperties: Property[] = [
    {
        id: "1",
        title: "Numi Villa Pangandaran",
        location: "Cluster Kaliandra, Pananjung, Kec. Pangandaran, Kab. Pangandaran, Jawa Barat 46396",
        description: "Bayangkan pagi hari yang sempurna — secangkir kopi hangat di tepi kolam renang privat, hembusan angin sepoi dari pantai Pangandaran, dan ketenangan yang jarang bisa kamu temukan di tempat lain. Itulah yang menanti di Numi Villa.\n\nNumi Villa adalah villa modern minimalis yang dirancang untuk mereka yang menghargai keindahan dalam kesederhanaan. Dengan sentuhan desain elegan dan suasana yang tenang, setiap sudut villa ini hadir untuk memberikan pengalaman menginap yang tak terlupakan — baik untuk liburan keluarga, staycation bersama pasangan, maupun quality time bersama sahabat.\n\nDilengkapi dengan 2 kamar tidur luas dan 2 kamar mandi modern, villa ini menawarkan kenyamanan yang sesungguhnya. Ruang keluarga yang lega menjadi tempat ideal untuk bersantai, sementara dapur lengkap siap mendukung siapa pun yang ingin memasak hidangan favorit. Pendingin ruangan di setiap ruangan memastikan kenyamanan sepanjang hari, bahkan di terik siang sekalipun.\n\nFasilitas unggulan kami — kolam renang privat — adalah alasan tersendiri untuk jatuh cinta pada villa ini. Berenang kapan saja tanpa gangguan, nikmati momen sunset di tepi kolam, atau sekadar duduk santai sambil membiarkan waktu berjalan lebih lambat.",
        price: 1000000,
        beds: 2,
        baths: 2,
        sqft: "42/60",
        image: "/properties/main-villa.png",
        coordinates: {
            lat: -7.6892144,
            lng: 108.6552914
        },
        amenities: ["Private Pool", "Living Room", "Full Kitchen", "Air Conditioning", "Wifi", "Parking"],
        googleMapsUrl: "https://maps.app.goo.gl/LVDBNvCsSxu94TYRA",
    },
    // {
    //     id: "2",
    //     title: "Tropical Surfer's Retreat",
    //     location: "Pangandaran, West Java",
    //     description: "A cozy tropical retreat perfectly situated near the main surf breaks. Surrounded by lush gardens.",
    //     price: 850000,
    //     beds: 2,
    //     baths: 2,
    //     sqft: 1100,
    //     image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    //     coordinates: {
    //         lat: -7.6850,
    //         lng: 108.6600
    //     },
    //     amenities: ["Surf Rack", "Ocean View", "Garden", "Outdoor Shower", "Wifi"]
    // },
    // {
    //     id: "3",
    //     title: "Jungle Canopy House",
    //     location: "Pangandaran, West Java",
    //     description: "Immerse yourself in nature in this beautiful house elevated among the trees, offering spectacular jungle views.",
    //     price: 1200000,
    //     beds: 3,
    //     baths: 2,
    //     sqft: 1350,
    //     image: "https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    //     coordinates: {
    //         lat: -7.6750,
    //         lng: 108.6450
    //     },
    //     amenities: ["Jungle View", "Hammock", "Nature Trails", "Private Deck", "Wifi"]
    // },
    // {
    //     id: "4",
    //     title: "Modern Fisherman's Cabin",
    //     location: "Pangandaran, West Java",
    //     description: "A newly renovated traditional-style cabin overlooking the fishing boats in the harbor.",
    //     price: 600000,
    //     beds: 2,
    //     baths: 1,
    //     sqft: 900,
    //     image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    //     coordinates: {
    //         lat: -7.6950,
    //         lng: 108.6650
    //     },
    //     amenities: ["Harbor View", "Patio", "Bikes Included", "Pet Friendly", "Wifi"]
    // },
    // {
    //     id: "5",
    //     title: "Coastal Family Compound",
    //     location: "Pangandaran, West Java",
    //     description: "Spacious compound ideal for large family gatherings, featuring a private pool and large dining area.",
    //     price: 2500000,
    //     beds: 6,
    //     baths: 4,
    //     sqft: 2800,
    //     image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    //     coordinates: {
    //         lat: -7.6820,
    //         lng: 108.6550
    //     },
    //     amenities: ["Private Pool", "BBQ Grill", "Large Kitchen", "Parking", "Wifi"]
    // },
    // {
    //     id: "6",
    //     title: "Sunset Hilltop Studio",
    //     location: "Pangandaran, West Java",
    //     description: "Quiet, romantic studio on the hill with uninterrupted views of the sunset over the Indian Ocean.",
    //     price: 500000,
    //     beds: 1,
    //     baths: 1,
    //     sqft: 600,
    //     image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    //     coordinates: {
    //         lat: -7.6780,
    //         lng: 108.6400
    //     },
    //     amenities: ["Sunset View", "Balcony", "Kitchenette", "Wifi"]
    // }
];
