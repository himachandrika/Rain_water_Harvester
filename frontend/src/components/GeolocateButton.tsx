type Props = { onLocate: (lat: number, lon: number) => void };
export default function GeolocateButton({ onLocate }: Props) {
	async function handleClick() {
		if (!('geolocation' in navigator)) return alert('Geolocation not supported');
		navigator.geolocation.getCurrentPosition((pos) => {
			onLocate(pos.coords.latitude, pos.coords.longitude);
		}, (err) => {
			alert('Failed to get location');
		}, { enableHighAccuracy: true, timeout: 8000 });
	}
	return (
		<button className="bg-purple-600 text-white px-3 py-1 rounded" onClick={handleClick}>Use My Location</button>
	);
}
