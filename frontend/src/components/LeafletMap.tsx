import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type Props = { lat: number; lon: number; onChange: (lat: number, lon: number) => void; height?: string };

const icon = new L.Icon({
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41]
});

function ClickHandler({ onChange }: { onChange: (lat: number, lon: number) => void }) {
	useMapEvents({
		click(e) {
			onChange(e.latlng.lat, e.latlng.lng);
		}
	});
	return null;
}

export default function LeafletMap({ lat, lon, onChange, height = '360px' }: Props) {
	return (
		<div style={{ height }}>
			<MapContainer center={[lat, lon]} zoom={10} style={{ height: '100%', width: '100%' }}>
				<TileLayer attribution='© OpenStreetMap contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
				<Marker position={[lat, lon]} icon={icon} />
				<ClickHandler onChange={onChange} />
			</MapContainer>
		</div>
	);
}
