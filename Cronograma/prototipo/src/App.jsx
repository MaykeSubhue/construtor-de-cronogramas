import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Planos from './pages/Planos.jsx'
import NovoPlano from './pages/NovoPlano.jsx'
import Construcao from './pages/Construcao.jsx'
import Cronograma from './pages/Cronograma.jsx'
import Completude from './pages/Completude.jsx'
import Simulacao from './pages/Simulacao.jsx'
import Acompanhamento from './pages/Acompanhamento.jsx'
import Cadastros from './pages/Cadastros.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/novo" element={<NovoPlano />} />
        <Route path="/plano/:id/construcao" element={<Construcao />} />
        <Route path="/plano/:id/cronograma" element={<Cronograma />} />
        <Route path="/plano/:id/completude" element={<Completude />} />
        <Route path="/plano/:id/simulacao" element={<Simulacao />} />
        <Route path="/plano/:id/acompanhamento" element={<Acompanhamento />} />
        <Route path="/cadastros" element={<Cadastros />} />
        <Route path="/cadastros/:secao" element={<Cadastros />} />
      </Routes>
    </AppShell>
  )
}
