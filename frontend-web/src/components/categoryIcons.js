import {
  IconBowl,
  IconBread,
  IconCoffee,
  IconEgg,
  IconGlass,
  IconGrid,
  IconLeaf,
  IconPlus,
  IconTag,
  IconUtensils,
} from './Icons'

// Quita acentos y mayúsculas para comparar nombres de categoría ("Sándwiches" -> "sandwiches")
const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

// Las categorías vienen del backend; las conocidas tienen ícono propio
const iconos = {
  todos: IconGrid,
  cafe: IconCoffee,
  bebidas: IconGlass,
  licuados: IconGlass,
  'desayunos de huevos': IconEgg,
  burritos: IconUtensils,
  tacos: IconUtensils,
  molletes: IconBread,
  sandwiches: IconBread,
  tortas: IconBread,
  guisados: IconBowl,
  chilaquiles: IconBowl,
  ensaladas: IconLeaf,
  combos: IconTag,
  extras: IconPlus,
}

export const iconForCategory = (categoria = '') => iconos[normalizar(categoria)] ?? IconUtensils

// Uno de 4 tonos de color, siempre el mismo para la misma categoría
export const toneForCategory = (categoria = '') => {
  let suma = 0
  for (const letra of normalizar(categoria)) suma += letra.charCodeAt(0)
  return suma % 4
}
