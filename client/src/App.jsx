import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/todos/1')
      .then((response) => setMessage(response.data.title))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div>
      <h1>Test App</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;