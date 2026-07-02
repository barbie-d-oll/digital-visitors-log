import Sidebar from './components/layouts/Sidebar';
import Header from './components/layouts/Header';
export default function Home() {
  return (
    <main className="flex ">
      <Header />
      <Sidebar />
      <h1 className="flex-1 bg-gray-100 p-8">
        Dashboard Content
      </h1>
    </main>
  );
}