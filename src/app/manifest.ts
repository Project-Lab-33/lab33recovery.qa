import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "The Lab 33 | Future of Recovery",
        short_name: "The Lab 33",
        description: "Doha's premier biohacking & recovery lab in The Pearl. Specializing in Cold Plunge, Red Light Sauna, HBOT, Normatec Therapy & Guided Stretch.",
        start_url: "/",
        display: "standalone",
        background_color: "#050505",
        theme_color: "#D4AF77",
        orientation: "portrait-primary",
        icons: [
            {
                src: "/icon.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/apple-icon.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
