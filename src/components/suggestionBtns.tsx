import data from "../data/data.json"
import Vector from "../assets/icons/vector.png"

function SuggestionBtns() {
  return (
    <div className='flex gap-3 mt-9 '>
        {data.data.map((item: { title: string; des: string })=>{
            return (
                <div className=" dark:bg-background-secondary-dark bg-background-secondary py-7 px-4  rounded-xl dark:shadow-[inset_-0px_-0px_15px_rgba(0,0,0,0.4)] shadow-[inset_-0px_-0px_10px_rgba(0,0,0,0.2)] dark:border-border-color-dark border-border-color border">
                    <div key={item.title}className='justify-between items-center flex'>
                        <p className="text-lg text-primary dark:text-primary-dark">{item.title}</p>
                        <img src={Vector} alt="icon" />
                    </div>
                    <p className='text-xs text-primary dark:text-primary-dark '>{item.des}</p>
                </div>
            )
        })}
    </div>
  )
}

export default SuggestionBtns