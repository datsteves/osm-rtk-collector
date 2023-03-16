/*
TO MAP FEATURES:

- Bicycle Parking
  - type of stand
  - number of spaces
- Post/Mail Box
- bench
- waste basket
- Barrier
  - bollard
  - cycle barrier
- fire hydrant
- lamp
  - type
  - numer of lamps
- survey point
- power
  - type => transformer
- telecom
  - connection point
- man hole
  - drain
  - water
  - gas
  - power
  - telecom
  - sewer
- tree
- sign


Lines
- Barrier
  - type => hedge, cable, fence, hand rail, kerb, wall
- ways
  - primary
  - cycle
  - foot
  - other
- steps

*/

const data: Record<string, any> = {
  points: [],
  lines: [],
  pointTypes: [
    {
      name: 'Other',
      id: 'other',
    },
  ],
};

function createPoint(category: string, types?: string[]) {
  const tmp = types || [];
  const point = {
    name: category,
    types: [...tmp, 'other'],
  };
  data.points.push(point);
  for (const t of tmp) {
    data.pointTypes.push({
      name: t,
      id: `${category}_${t.split(' ').join('-')}`,
      category,
    });
  }
}

createPoint('generic', ['road', 'sidewalk']);
createPoint('bicyle parking', ['stand', 'wallloops', 'floor']);
createPoint('lamp', ['straight pole', 'bend pole']);
createPoint('tree');
createPoint('bench');
createPoint('mailbox');
createPoint('waste management', ['basket']);
createPoint('barrier', ['bollard', 'cycle barrier']);
createPoint('fire hydrant');
createPoint('power managment', ['transformer']);
createPoint('telecom', ['dist box', 'connection box']);
createPoint('manhole', ['drain', 'water', 'gas', 'power', 'telecom', 'sewer']);
createPoint('sign', ['street', 'direction']);
createPoint('information', ['map', 'events']);

createPoint('survey point', ['stone', 'in ground']);

data.pointTypes.sort((a: Record<string, any>, b: Record<string, any>) => {
  if (a.name > b.name) {
    return 1;
  }
  return -1;
});

export default data;
