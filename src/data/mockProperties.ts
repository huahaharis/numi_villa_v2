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
];

