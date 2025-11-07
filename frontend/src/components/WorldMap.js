import { memo } from 'react';
import {
	ComposableMap,
	Geographies,
	Geography,
	ZoomableGroup,
} from 'react-simple-maps';

const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

// Country code mapping (ISO Alpha-2 to ISO Numeric)
const countryCodeMap = {
	AF: '004',
	AX: '248',
	AL: '008',
	DZ: '012',
	AS: '016',
	AD: '020',
	AO: '024',
	AI: '660',
	AQ: '010',
	AG: '028',
	AR: '032',
	AM: '051',
	AW: '533',
	AU: '036',
	AT: '040',
	AZ: '031',
	BS: '044',
	BH: '048',
	BD: '050',
	BB: '052',
	BY: '112',
	BE: '056',
	BZ: '084',
	BJ: '204',
	BM: '060',
	BT: '064',
	BO: '068',
	BQ: '535',
	BA: '070',
	BW: '072',
	BV: '074',
	BR: '076',
	IO: '086',
	BN: '096',
	BG: '100',
	BF: '854',
	BI: '108',
	KH: '116',
	CM: '120',
	CA: '124',
	CV: '132',
	KY: '136',
	CF: '140',
	TD: '148',
	CL: '152',
	CN: '156',
	CX: '162',
	CC: '166',
	CO: '170',
	KM: '174',
	CG: '178',
	CD: '180',
	CK: '184',
	CR: '188',
	CI: '384',
	HR: '191',
	CU: '192',
	CW: '531',
	CY: '196',
	CZ: '203',
	DK: '208',
	DJ: '262',
	DM: '212',
	DO: '214',
	EC: '218',
	EG: '818',
	SV: '222',
	GQ: '226',
	ER: '232',
	EE: '233',
	ET: '231',
	FK: '238',
	FO: '234',
	FJ: '242',
	FI: '246',
	FR: '250',
	GF: '254',
	PF: '258',
	TF: '260',
	GA: '266',
	GM: '270',
	GE: '268',
	DE: '276',
	GH: '288',
	GI: '292',
	GR: '300',
	GL: '304',
	GD: '308',
	GP: '312',
	GU: '316',
	GT: '320',
	GG: '831',
	GN: '324',
	GW: '624',
	GY: '328',
	HT: '332',
	HM: '334',
	VA: '336',
	HN: '340',
	HK: '344',
	HU: '348',
	IS: '352',
	IN: '356',
	ID: '360',
	IR: '364',
	IQ: '368',
	IE: '372',
	IM: '833',
	IL: '376',
	IT: '380',
	JM: '388',
	JP: '392',
	JE: '832',
	JO: '400',
	KZ: '398',
	KE: '404',
	KI: '296',
	KP: '408',
	KR: '410',
	KW: '414',
	KG: '417',
	LA: '418',
	LV: '428',
	LB: '422',
	LS: '426',
	LR: '430',
	LY: '434',
	LI: '438',
	LT: '440',
	LU: '442',
	MO: '446',
	MK: '807',
	MG: '450',
	MW: '454',
	MY: '458',
	MV: '462',
	ML: '466',
	MT: '470',
	MH: '584',
	MQ: '474',
	MR: '478',
	MU: '480',
	YT: '175',
	MX: '484',
	FM: '583',
	MD: '498',
	MC: '492',
	MN: '496',
	ME: '499',
	MS: '500',
	MA: '504',
	MZ: '508',
	MM: '104',
	NA: '516',
	NR: '520',
	NP: '524',
	NL: '528',
	NC: '540',
	NZ: '554',
	NI: '558',
	NE: '562',
	NG: '566',
	NU: '570',
	NF: '574',
	MP: '580',
	NO: '578',
	OM: '512',
	PK: '586',
	PW: '585',
	PS: '275',
	PA: '591',
	PG: '598',
	PY: '600',
	PE: '604',
	PH: '608',
	PN: '612',
	PL: '616',
	PT: '620',
	PR: '630',
	QA: '634',
	RE: '638',
	RO: '642',
	RU: '643',
	RW: '646',
	BL: '652',
	SH: '654',
	KN: '659',
	LC: '662',
	MF: '663',
	PM: '666',
	VC: '670',
	WS: '882',
	SM: '674',
	ST: '678',
	SA: '682',
	SN: '686',
	RS: '688',
	SC: '690',
	SL: '694',
	SG: '702',
	SX: '534',
	SK: '703',
	SI: '705',
	SB: '090',
	SO: '706',
	ZA: '710',
	GS: '239',
	SS: '728',
	ES: '724',
	LK: '144',
	SD: '729',
	SR: '740',
	SJ: '744',
	SZ: '748',
	SE: '752',
	CH: '756',
	SY: '760',
	TW: '158',
	TJ: '762',
	TZ: '834',
	TH: '764',
	TL: '626',
	TG: '768',
	TK: '772',
	TO: '776',
	TT: '780',
	TN: '788',
	TR: '792',
	TM: '795',
	TC: '796',
	TV: '798',
	UG: '800',
	UA: '804',
	AE: '784',
	GB: '826',
	US: '840',
	UM: '581',
	UY: '858',
	UZ: '860',
	VU: '548',
	VE: '862',
	VN: '704',
	VG: '092',
	VI: '850',
	WF: '876',
	EH: '732',
	YE: '887',
	ZM: '894',
	ZW: '716',
};

const WorldMap = ({ geographyData }) => {
	// Convert geography data to a map for quick lookup
	const dataMap = {};
	const fullDataMap = {}; // Store full data including unique_visitors
	let totalVisits = 0;
	let totalUniqueVisitors = 0;
	
	if (geographyData) {
		for (const item of geographyData) {
			const numericCode = countryCodeMap[item.country];
			if (numericCode) {
				dataMap[numericCode] = item.views;
				fullDataMap[numericCode] = {
					views: item.views,
					uniqueVisitors: item.unique_visitors,
					country: item.country,
				};
				totalVisits += item.views;
				totalUniqueVisitors += item.unique_visitors;
			}
		}
	}

	// Find max visits for color scaling
	const maxVisits = Math.max(...Object.values(dataMap), 1);

	const getColor = (geo) => {
		const geoId = geo.id;
		const visits = dataMap[geoId] || 0;

		if (visits === 0) {
			return '#e5e7eb'; // gray-200 for no visits
		}

		// Color scale from light blue to dark blue
		const intensity = visits / maxVisits;
		if (intensity > 0.75) return '#1e40af'; // blue-800
		if (intensity > 0.5) return '#2563eb'; // blue-600
		if (intensity > 0.25) return '#3b82f6'; // blue-500
		return '#93c5fd'; // blue-300
	};

	const getHoverColor = (geo) => {
		const geoId = geo.id;
		const visits = dataMap[geoId] || 0;

		if (visits === 0) {
			return '#d1d5db'; // gray-300 for no visits (subtle hover)
		}

		// Darker blue for hover on countries with data
		return '#1e3a8a'; // blue-900
	};

	return (
		<div className='w-full h-full flex flex-col overflow-hidden bg-gray-50 rounded-lg'>
			{/* Header with stats */}
			<div className='flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200'>
				<div className='flex items-center gap-4 text-xs text-gray-600'>
					<span>
						<span className='font-semibold text-gray-900'>{totalVisits}</span> total visits
					</span>
					<span className='text-gray-300'>•</span>
					<span>
						<span className='font-semibold text-gray-900'>{totalUniqueVisitors}</span> unique visitors
					</span>
				</div>
				
				{/* Legend */}
				<div className='flex items-center gap-2 text-xs text-gray-600'>
					<span>Activity:</span>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-3 rounded' style={{ backgroundColor: '#93c5fd' }} />
						<span>Low</span>
					</div>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-3 rounded' style={{ backgroundColor: '#3b82f6' }} />
						<span>Med</span>
					</div>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-3 rounded' style={{ backgroundColor: '#2563eb' }} />
						<span>High</span>
					</div>
					<div className='flex items-center gap-1'>
						<div className='w-3 h-3 rounded' style={{ backgroundColor: '#1e40af' }} />
						<span>Very High</span>
					</div>
				</div>
			</div>

			{/* Map */}
			<div className='flex-1 flex items-center justify-center overflow-hidden -mt-8'>
				<ComposableMap
					projectionConfig={{
						scale: 147,
						center: [0, 20],
					}}
					width={800}
					height={380}
					style={{ width: '100%', height: 'auto', maxHeight: '100%', background: '#f9fafb' }}
				>
					<ZoomableGroup>
						<Geographies geography={geoUrl}>
							{({ geographies }) =>
								geographies.map((geo) => {
									const visits = dataMap[geo.id] || 0;
									const hasData = visits > 0;
									const data = fullDataMap[geo.id];
									const percentage = totalVisits > 0 ? ((visits / totalVisits) * 100).toFixed(1) : 0;
									
									return (
										<Geography
											key={geo.rsmKey}
											geography={geo}
											fill={getColor(geo)}
											stroke='#6b7280'
											strokeWidth={0.75}
											style={{
												default: { 
													outline: 'none',
													transition: 'all 0.2s ease-in-out',
												},
												hover: {
													fill: getHoverColor(geo),
													outline: 'none',
													cursor: hasData ? 'pointer' : 'default',
													strokeWidth: hasData ? 1.5 : 0.75,
													transition: 'all 0.2s ease-in-out',
												},
												pressed: { outline: 'none' },
											}}
										>
											<title>
												{geo.properties.name}
												{hasData ? `\n${visits} visit${visits !== 1 ? 's' : ''} (${percentage}%)\n${data.uniqueVisitors} unique visitor${data.uniqueVisitors !== 1 ? 's' : ''}` : '\nNo visits'}
											</title>
										</Geography>
									);
								})
							}
						</Geographies>
					</ZoomableGroup>
				</ComposableMap>
			</div>
		</div>
	);
};

export default memo(WorldMap);
