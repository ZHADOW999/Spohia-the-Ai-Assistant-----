import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { MoreHorizontal,PencilIcon,TrashIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger,DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import logo from '../assets/logo.png'
import Setting from '../assets/icons/setting.png';
import SettingDark from '../assets/icons/settingDark.png'
import NewChat from "../assets/icons/newChat.svg"
import NewChatDark from '../assets/icons/newChartDark.png';
import Search from '../assets/icons/search.png';
import SearchDark from '../assets/icons/searchDark.png'
import { useTheme } from "@/components/theme/theme-provider";


interface Chat {
  id: string;
  title: string;
}

interface AppSidebarProps {
  chats: Chat[];
  activeChat: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

function AppSidebar({ chats, activeChat, onNewChat, onSelectChat, onDeleteChat }: AppSidebarProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  return (
    <aside className="bg-background-secondary dark:bg-bg-3-dark ">
      <Sidebar className="border-0 outline-none border-none dark:border-border-color-dark  bg-background-secondary dark:bg-bg-3-dark">
        <SidebarHeader className="pt-10 pb-4 px-4 bg-background-secondary dark:bg-bg-3-dark ">
          <div className="mb-7 flex justify-between items-center">
            <img src={logo} alt="logo" className="size-9" />
            <SidebarTrigger className="cursor-pointer text-5xl !text-primary dark:!text-primary-dark  md:hidden "/>
          </div>
          <SidebarMenuButton
            onClick={onNewChat}
            className="flex items-center justify-center w-full mb-0 text-primary dark:text-primary-dark hover:translate-y-[-2px]  p-[1.5px] h-11  hover:bg-gradient-to-t dark:from-[#060A0D] from-0% dark:via-[#1e1e1e] via-52% dark:to-[#1F2224] to-100% hover:from-[#F9F5F2] hover:via-[#e1e1e1] hover:to-[#E0DDDB]  rounded-4xl transition-all ease-in-out inset-shadow-xs font-family-regular cursor-pointer duration-200 active:translate-y-0 "
          >
            <div className="dark:hover:bg-[#111417]/80 hover:bg-[#EAEAEA]/80 pl-5  backdrop-blur h-full w-full flex  items-center gap-3 rounded-[calc(2rem-2px)]">
              <img className="size-6" src={isDarkMode ? NewChatDark : NewChat} alt="" />
              New Chat
            </div>
          </SidebarMenuButton>
          {/* <SidebarMenuButton
            onClick={onNewChat}
            className="w-full mb-4 text-primary dark:text-primary-dark hover:translate-y-[-2px] !backdrop-blur-2xl  bg-[#111417]/64   p-6 rounded-full transition-all ease-in-out font-family-regular cursor-pointer duration-200 active:translate-y-0 "
            // className="w-full mb-4 text-primary dark:text-primary-dark hover:translate-y-[-2px] hover:bg-border-color hover:dark:bg-background-dark transition-all ease-in-out font-family-regular cursor-pointer duration-200 active:translate-y-0 "
          >
            <img className="size-6" src={isDarkMode ? NewChatDark : NewChat} alt="" />
            New Chat
          </SidebarMenuButton> */}
          <SidebarMenuButton
           className="flex items-center justify-center w-full mb-4 text-primary dark:text-primary-dark hover:translate-y-[-2px]  p-[1.5px] h-11  hover:bg-gradient-to-t from-[#060A0D] from-0% via-[#1e1e1e] via-52% to-[#1F2224] to-100% hover:from-[#F9F5F2] hover:via-[#e1e1e1] hover:to-[#E0DDDB]  rounded-4xl transition-all ease-in-out inset-shadow-xs font-family-regular cursor-pointer duration-200 active:translate-y-0 "
          >
           <div className="dark:hover:bg-[#111417]/80 hover:bg-[#EAEAEA]/80 pl-5  backdrop-blur h-full w-full flex  items-center gap-3 rounded-[calc(2rem-2px)]">
              <img src={isDarkMode ? SearchDark : Search} alt="" className="size-5" />
              Search Chats
           </div>
          </SidebarMenuButton>
        </SidebarHeader>
        <div className="h-[1px] w- bg-border-color dark:bg-border-color-dark"></div>
        <SidebarContent className="pt-8 bg-background-secondary dark:bg-bg-3-dark text-primary dark:text-primary-dark">
          <SidebarGroupLabel className="font-family-semibold text-lg text-primary dark:text-primary-dark">Recent Chats</SidebarGroupLabel>
          <SidebarGroup>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem  
                className={` group/dropdown  
                  flex items-center justify-center w-full mb-0 text-primary dark:text-primary-dark   p-[1.5px] h-11  hover:bg-gradient-to-t dark:hover:from-[#060A0D] from-0% dark:hover:via-[#1e1e1e] via-52% dark:hover:to-[#1F2224] to-100% hover:from-[#F9F5F2] hover:via-[#e1e1e1] hover:to-[#E0DDDB] rounded-4xl transition-all ease-in-out inset-shadow-xs font-family-regular cursor-pointer duration-200   ${chat.id === activeChat ? 'bg-gradient-to-t dark:from-[#060A0D] from-0% dark:via-[#1e1e1e] via-52% dark:to-[#1F2224] to-100% from-[#F9F5F2] via-[#elelel] to-[#E0DDDB]' : ''}`}
                // className={` group/dropdown  
                //   cursor-pointer rounded-md w-full text-primary dark:text-primary-dark hover:bg-border-color hover:dark:bg-background-dark transition-all ease-in-out  ${chat.id === activeChat ? 'bg-border-color dark:bg-background-dark font-family-bold text-2xl' : ''}`}
                // className="group/dropdown"
                  key={chat.id}>
                  <div className={`dark:hover:bg-[#111417]/80 hover:bg-[#EAEAEA]/80 pl-5  backdrop-blur h-full w-full flex  items-center gap-3 rounded-[calc(2rem-2px)] ${chat.id === activeChat ? 'dark:bg-[#111417]/80 bg-[#EAEAEA]/80' : ''}`}>
                    <SidebarMenuButton
                      className="cursor-pointer "
                      isActive={chat.id === activeChat}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      {chat.title}
  
  
  
                    </SidebarMenuButton>
                  </div >
                  <DropdownMenu >
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction className="h-[70%] cursor-pointer flex items-center justify-center lg:opacity-0 active:opacity-100 lg:group-hover/dropdown:opacity-100 transition-all duration-200 ease-linear">
                          <MoreHorizontal
                          //  className="cursor-pointer lg:block   lg:group-hover/dropdown:block transition-all duration-200 ease-linear"
                           />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="space-y-1 z-100 bg-background-secondary border border-border-color-dark dark:border-border-color dark:bg-bg-3-dark text-primary dark:text-primary-dark p-2 rounded-lg " side="right" align="start">
                        <DropdownMenuItem className="!text-primary flex dark:!text-primary-dark hover:dark:bg-background-dark border-0 outline-none hover:bg-border-color cursor-pointer rounded-md px-2 py-1 transition-all duration-200 ease-in-out text-sm hover:dark:text-primary font-family-regular ">
                          <PencilIcon className="size-4 mr-2" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className=" flex text-red-700  hover:bg-red-200 outline-none cursor-pointer rounded-md px-2 py-1 transition-all duration-200 ease-in-out text-sm font-family-regular "
                          onClick={() => onDeleteChat(chat.id)}
                        >
                          <TrashIcon className="size-4 mr-2" />
                          <span>Delete </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="h-[1px] w-full bg-border-color dark:bg-border-color-dark"></div>
        <SidebarFooter className="bg-background-secondary dark:bg-bg-3-dark" >
          <SidebarMenu className="my-4">
            <SidebarMenuItem className="font-family-regular cursor-pointer rounded-md w-full text-primary dark:text-primary-dark hover:translate-y-[-2px] hover:bg-border-color hover:dark:bg-background-dark transition-all ease-in-out  duration-200 active:translate-y-0">
              <SidebarMenuButton
                className="cursor-pointer"
                
              >
                <img src={isDarkMode ? SettingDark : Setting} alt="" className="size-6"/>
              Settings & Feeback
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter >
      </Sidebar>
    </aside>
  )
}

export default AppSidebar