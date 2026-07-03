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
        description: 'Bid on TVs, gadgets, and everyday electronics at competitive prices.',
        name: 'Electronics',
        },
    {
        id: 2,
        image: clothing,
        description: 'Find quality clothing and fashion items you can bid on and save more',
        name: 'Clothing',

    },
    {
        id: 3,
        image: utensils,
        description: 'Discover household and kitchen items that make everyday living easier.',
        name: 'Home / Kitchen',

    },
    {
        id: 4,
        image: office,
        description: 'Bid on office supplies and equipment for work or business use.',
        name: 'Office Products',

    },
    {
        id: 5,
        image: phoneAccessories,
        description: 'Get smartphones, chargers, and accessories through fair bidding.',
        name: 'Phones & Accessories',

    },
    {
        id: 6,
        image: car,
        description: 'Find vehicle parts and accessories to keep your car in good shape.',
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
                {mockProducts.map((category) => (
                    <CategoryCard key={category.id} category={category}  />
                ))}
            </div>
        </div>
    )
}
