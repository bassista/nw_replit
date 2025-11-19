import TopBar from '../TopBar';

export default function TopBarExample() {
  return (
    <TopBar 
      title="Diario Alimentare" 
      showSearch={true}
      showAdd={true}
      onSearch={() => console.log('Search clicked')}
      onAdd={() => console.log('Add clicked')}
    />
  );
}
