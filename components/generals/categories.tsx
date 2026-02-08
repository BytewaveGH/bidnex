'use client'
import iphone from '@/assets/images/phone.png'
import monitor from '@/assets/images/monitor.png'
import headset from '@/assets/images/headset.png'
import { CategoryType, ProductCardType } from '@/lib/interfaces'
import CategoryCard from './category-card'
import electronics from '@/assets/images/electronics.png'
import clothing from '@/assets/images/clothing.png'
import car from '@/assets/images/car.png'
import office from '@/assets/images/office.png'
import phoneAccessories from '@/assets/images/phone-accessories.png'
import utensils from '@/assets/images/utensils.png'

const mockProducts: CategoryType[] = [
    {
        id: 1,
        image: electronics,
        description: <p>Explore our diverse<br />categories to find the<br />perfect items for your<br />next bid!</p>,
        name: 'Electronics',
        },
    {
        id: 2,
        image: clothing,
        description:  <p>Explore our diverse<br />categories to find the<br />perfect items for your<br />next bid!</p>,
        name: 'Clothing',
        
    },
    {
        id: 3,
        image: utensils,
        description:  <p>Explore our diverse<br />categories to find the<br />perfect items for your<br />next bid!</p>,
        name: 'Home / Kitchen',
        
    },
    {
        id: 4,
        image: office,
        description:  <p>Explore our diverse<br />categories to find the<br />perfect items for your<br />next bid!</p>,
        name: 'Office Products',
        
    },
    {
        id: 5,
        image: phoneAccessories,
        description:  <p>Explore our diverse<br />categories to find the<br />perfect items for your<br />next bid!</p>,
        name: <p>Phones &<br />Accessories</p>,
        
    },
    {
        id: 6,
        image: car,
        description:  <p>Explore our diverse<br />categories to find the<br />perfect items for your<br />next bid!</p>,
        name: 'Car Parts',
        
    },
    
]

export default function Categories() {


    return (
        <div className="flex flex-col items-center justify-center w-full  ">
            <div className="flex w-full items-end justify-between mb-8">
                <div className="flex flex-col items-start justify-center">
                    <h2 className="text-3xl font-bold mb-1.5">Shop By Category</h2>
                    <div className="text-base font-normal text-[#657688]">
                    Explore our diverse categories<br/>to find the perfect items for<br/>your next bid!
                    </div>
                </div>
                
            </div>
            <div className="grid grid-cols-3 gap-6 w-full">
                {mockProducts.map((category) => (
                    <CategoryCard key={category.id} category={category}  />
                ))}
            </div>
        </div>
    )
}
