import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Slide,
  TextField,
  Typography,
} from '@mui/material';
import {
  FileDownloadRounded,
  MyLocation,
  PlaceRounded,
  SettingsRounded,
  TimelineRounded,
} from '@mui/icons-material';
import ReactDom from 'react-dom/server';
import leaflet from 'leaflet';

import data from './data';

const BASE_URL = `http://${window.location.hostname}:3001`;

const offset = {
  lat: -0.000018,
  lng: -0.000014,
};

const LeftButton = ({ name, active, onClick }: Record<string, any>) => {
  return (
    <Button
      variant={active ? 'contained' : 'outlined'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
      size="small"
      onClick={onClick}
    >
      {/* <Folder /> */}
      {name}
    </Button>
  );
};

const MapIcon = ({ color = 'red' }) => {
  return (
    <div
      style={{
        height: 24,
        width: 24,
        position: 'relative',
        borderRadius: 3,
        zIndex: 501,
        filter: 'drop-shadow(0px 2px 3px black)',
        // opacity: 0.7,
      }}
    >
      <PlaceRounded style={{ fill: color }} />
    </div>
  );
};

const CurrentPosition = ({ color = '#bbf' }) => {
  return (
    <div
      style={{
        height: 24,
        width: 24,
        position: 'relative',
        borderRadius: 3,
        zIndex: 501,
        filter: 'drop-shadow(0px 2px 3px black)',
        // opacity: 0.7,
      }}
    >
      <MyLocation style={{ fill: color }} />
    </div>
  );
};

const MapMarker = ({
  position,
  category,
  type,
  name,
  note,
  id,
  image,
}: Record<string, any>) => {
  const plIcon = React.useMemo(() => {
    const htmlIcon = leaflet.divIcon({
      html: ReactDom.renderToString(<MapIcon />),
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
    return htmlIcon;
  }, []);
  return (
    <Marker
      icon={plIcon}
      position={{
        lat: position.lat + offset.lat,
        lng: position.lng + offset.lng,
      }}
    >
      <Popup>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}
        >
          <span>Name:</span> <b>{name}</b>
          <span>Note:</span> <b>{note}</b>
          <span>Category:</span> <b>{category}</b>
          <span>Type:</span> <b>{type}</b>
          {image && (
            <>
              <span>Image</span>{' '}
              <a href={`${BASE_URL}/points/${id}/image`} target="_blank">
                <img
                  style={{ maxWidth: 200 }}
                  src={`${BASE_URL}/points/${id}/image`}
                />
              </a>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const MyPosition = ({ position, fix }: Record<string, any>) => {
  const plIcon = React.useMemo(() => {
    const htmlIcon = leaflet.divIcon({
      html: ReactDom.renderToString(<CurrentPosition />),
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    return htmlIcon;
  }, []);
  return (
    <Marker icon={plIcon} position={position}>
      <Popup>
        <div>Fix: {fix}</div>
      </Popup>
    </Marker>
  );
};

const Map = () => {
  const [points, setPoints] = React.useState([]);
  const [currentPos, setCurrentPos] = React.useState({
    lat: 49,
    lng: 52,
    fix: '3D',
  });
  React.useEffect(() => {
    let timeout: any = 0;
    const update = async () => {
      try {
        const resp = await fetch(`${BASE_URL}/points`)
          .then(res => res.json())
          .catch(elem => console.debug(elem));
        setPoints(resp.points);
        setCurrentPos(resp.currentPos);
      } catch (e) {
        console.error(e);
      }
      timeout = setTimeout(() => {
        update();
      }, 1000);
    };
    update();
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return (
    <MapContainer
      center={[53.751975, 7.487489]}
      zoom={18}
      // scrollWheelZoom={false}
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      zoomControl={false}
    >
      <TileLayer
        attribution=""
        maxZoom={23}
        maxNativeZoom={20}
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      {points.map((elem: Record<string, any>) => (
        <MapMarker
          position={{
            lat: elem.lat,
            lng: elem.lng,
          }}
          category={elem.category}
          type={elem.type}
          note={elem.note}
          name={elem.name}
          id={elem.id}
          key={elem.id}
          image={elem.imagePath}
        ></MapMarker>
      ))}
      {currentPos && (
        <MyPosition
          position={{
            lat: currentPos.lat + offset.lat,
            lng: currentPos.lng + offset.lng,
          }}
          fix={currentPos.fix}
        />
      )}
    </MapContainer>
  );
};

const PointEntry = () => {
  const [loading, setLoading] = React.useState(false);
  const [category, setCategory] = React.useState('');
  const [type, setType] = React.useState('');
  const [name, setName] = React.useState('');
  const [note, setNote] = React.useState('');
  const [base64, setBase64] = React.useState('');

  const onClickCategory = (id: string) => () => {
    if (id === category) {
      setCategory('');
    } else {
      setCategory(id);
    }
    setType('other');
  };

  const onClickType = (id: string, category?: string) => () => {
    if (id === type) {
      setType('other');
    } else {
      setType(id);
    }
    if (category) {
      setCategory(category);
    }
  };

  const shownTypes = data.pointTypes.filter((elem: Record<string, any>) => {
    if (!category) {
      return true;
    }
    if (!elem.category) {
      return true;
    }
    return category === elem.category;
  });

  const onSave = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/point`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        category,
        type,
        name,
        note,
        base64Image: base64,
      }),
    });
    setBase64('');
    setLoading(false);
  };

  const saveAndClear = async () => {
    await onSave();
    setCategory('');
    setType('other');
    setName('');
    setNote('');
    setBase64('');
  };

  const onFileChange = (e: Record<string, any>) => {
    console.debug(e.target.files);
    const file = e.target.files[0];
    // Encode the file using the FileReader API
    const reader = new FileReader();
    reader.onloadend = () => {
      // Use a regex to remove data url part
      if (!reader.result) {
        return;
      }
      const base64String = reader.result
        // @ts-expect-error ignore
        .replace('data:', '')
        .replace(/^.+,/, '');

      setBase64(base64String);
      // Logs wL2dvYWwgbW9yZ...
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',

          borderLeft: '5px solid #000',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: `repeat(${
              data.points.length || 1
            }, minmax(100px, max-content))`,
            gap: 1,
            overflow: 'auto',
            height: '1px',
            flexGrow: 1,
            width: 300,
            p: 1,
            bgcolor: 'background.paper',
            pointerEvents: 'all',
          }}
        >
          {data.points.map((elem: Record<string, any>) => (
            <LeftButton
              key={elem.name}
              name={elem.name}
              onClick={onClickCategory(elem.name)}
              active={category === elem.name}
            />
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '5px solid #000',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            // gridTemplateRows: 'repeat(auto-fill, 75px)',
            gridTemplateRows: `repeat(${
              shownTypes.length || 1
            }, minmax(100px, max-content))`,
            gap: 1,
            overflow: 'auto',
            height: '1px',
            flexGrow: 1,
            maxWidth: 250,
            p: 1,
            bgcolor: 'background.paper',
            minWidth: 200,
            pointerEvents: 'all',
          }}
        >
          {shownTypes.map((elem: Record<string, any>) => (
            <LeftButton
              key={elem.id}
              name={elem.name}
              onClick={onClickType(elem.id, elem.category)}
              active={type === elem.id}
            />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '5px solid #000',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 2,
            overflow: 'auto',
            // height: '1px',
            // flexGrow: 1,
            maxWidth: 350,
            width: 350,
            p: 1,
            bgcolor: 'background.paper',
            pointerEvents: 'all',
          }}
        >
          <TextField
            placeholder="Name"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <TextField
            placeholder="Note"
            multiline
            fullWidth
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <input type="file" onChange={onFileChange} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              b: {
                textTransform: 'uppercase',
              },
            }}
          >
            <Typography variant="body2">
              Category: <b>{category}</b>
            </Typography>
            <Typography variant="body2">
              Type: <b>{type}</b>
            </Typography>
          </Box>
          <Button
            color="secondary"
            disabled={loading}
            fullWidth
            variant="contained"
            onClick={onSave}
            size="large"
          >
            Save
          </Button>
          <Button
            color="secondary"
            disabled={loading}
            fullWidth
            variant="text"
            size="large"
            onClick={saveAndClear}
          >
            Save & Clear
          </Button>
        </Box>
      </Box>
    </>
  );
};

const Settings = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'all',
        borderLeft: '1px solid #000',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 2,
          overflow: 'auto',
          // height: '1px',
          // flexGrow: 1,
          maxWidth: 350,
          width: 350,
          p: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5">Settings</Typography>
        <OutlinedInput
          id="outlined-adornment-weight"
          endAdornment={<InputAdornment position="end">cm</InputAdornment>}
          placeholder="Atenna height above agl"
        />
        <Button variant="contained">Save</Button>
      </Box>
    </Box>
  );
};

function App() {
  const [activeTab, setActiveTab] = React.useState('');

  const onClickTab = (id: string) => () => {
    if (id === activeTab) {
      setActiveTab('');
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        overflow: 'hidden',
      }}
    >
      <Map />
      <Box
        sx={{
          zIndex: 1000,
          height: '100%',
          minWidth: 250,

          position: 'relative',
          display: 'flex',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '75px',
            pointerEvents: 'all',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1,
            zIndex: 1001,
          }}
        >
          <Button
            variant={activeTab === 'point' ? 'contained' : 'text'}
            onClick={onClickTab('point')}
            sx={{ height: 60, width: 75 }}
          >
            <PlaceRounded />
          </Button>
          <Button
            variant={activeTab === 'line' ? 'contained' : 'text'}
            onClick={onClickTab('line')}
            sx={{ height: 60, width: 75 }}
          >
            <TimelineRounded />
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'contained' : 'text'}
            onClick={onClickTab('settings')}
            sx={{ height: 60, width: 75 }}
          >
            <SettingsRounded />
          </Button>
          <Button
            href={`${BASE_URL}/gpx`}
            target="_blank"
            sx={{ height: 60, width: 75 }}
          >
            <FileDownloadRounded />
          </Button>
        </Box>
        <Box>
          <Slide direction="right" in={activeTab === 'point'}>
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 75,
                pointerEvents: 'none',
              }}
            >
              <PointEntry />
            </Box>
          </Slide>
          <Slide direction="right" in={activeTab === 'settings'}>
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 75,
              }}
            >
              <Settings />
            </Box>
          </Slide>
        </Box>
      </Box>
    </div>
  );
}

export default App;
