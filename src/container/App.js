import DataSheet from '../components/DataSheet';
import '../stylings/App.css';

const employeeData = [
  {
    id: 0,
    name: 'Josh',
    surname: 'Bryan',
    birthday: '10/10/1990',
    position: 'Lead Engineer',
    phoneNumber: '+1 (500) 000 00 00'
  },
  {
    id: 1,
    name: 'Alex',
    surname: 'Koshelkov',
    birthday: '11/02/1994',
    position: 'Sales',
    phoneNumber: '+1 (300) 000 90 00'
  },
  {
    id: 2,
    name: 'Pripa',
    surname: 'Michael',
    birthday: '03/10/2001',
    position: 'Intern',
    phoneNumber: '+1 (111) 333 00 00'
  },
  {
    id: 3,
    name: 'Tommy',
    surname: 'Handerson',
    birthday: '06/09/1970',
    position: 'CTO',
    phoneNumber: '+1 (999) 111 00 01'
  }
];

function App() {
  const onSubmit = (data) => {
    console.log(data);
  }

  return (
    <div className={'container'}>
      <DataSheet
        data={employeeData}
        onSubmit={onSubmit}
      />
      <p>Hint: Press <b>"Enter"</b> to update the cell.</p>
      <p>Developed by Rufat Mammadli (<a href="http://github.com/rufat" target="_blank" rel="noreferrer">@rufat</a>)</p>
    </div>
  );
}

export default App;
