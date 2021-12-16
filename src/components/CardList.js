import { Box } from '@mui/material';
import PokemonCard from './PokemonCard';

export default function CardList(props){
  const { cards, addTo, removeFrom } = props;

  return (
    <Box sx={{display: "fex", justifyContent: "flex-start"}} flexWrap="wrap" maxWidth="900px" mx="auto">
    {
      cards.map((card) => (
        <PokemonCard card={card} addTo={addTo} removeFrom={removeFrom}></PokemonCard>
      ))
    }
    </Box>
  )
}
