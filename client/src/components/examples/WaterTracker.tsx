import WaterTracker from '../WaterTracker';
import { useState } from 'react';

export default function WaterTrackerExample() {
  const [mlConsumed, setMlConsumed] = useState(1200);
  
  return (
    <div className="p-4">
      <WaterTracker 
        mlConsumed={mlConsumed}
        targetMl={2000}
        glassCapacityMl={200}
        onAddGlass={() => setMlConsumed(prev => prev + 200)}
      />
    </div>
  );
}
