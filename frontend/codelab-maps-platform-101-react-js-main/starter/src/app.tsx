/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import React from 'react';
import { createRoot } from "react-dom/client";
import { APIProvider } from '@vis.gl/react-google-maps';
import maps_api_key from '../secrets';
const App = () => (
    <APIProvider apiKey={} onLoad={() => console.log('Maps API has loaded.')}>
        <h1>Hello, world!</h1>
    </APIProvider>
);

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;