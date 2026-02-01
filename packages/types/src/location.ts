export interface LocationData {
  zone: string;              // "Hall A", "Food Court"
  floor: string;             // "Ground Floor", "Level 2"
  landmarks: string[];       // ["Near entrance", "Next to restrooms"]
  coordinates: {
    lat: number;
    lng: number;
  };
}
