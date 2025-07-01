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
import NewChatDark from '../assets/icons/newChartDark.svg';
import Search from '../assets/icons/search.png';
import SearchDark from '../assets/icons/searchDark.png'
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  chats: string[];
  activeChat: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

function AppSidebar({ chats, activeChat, onNewChat, onSelectChat }: AppSidebarProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  return (
    <aside className="bg-background-secondary dark:bg-background-secondary-dark ">
      <Sidebar className="border-0 outline-none bg-background-secondary dark:bg-background-secondary-dark">
        <SidebarHeader className="py-10 px-4 bg-background-secondary dark:bg-background-secondary-dark ">
          <div className="mb-7 flex justify-between items-center">
            <img src={logo} alt="logo" className="size-9" />
            <SidebarTrigger className="sm:hidden text-5xl !text-primary dark:!text-primary-dark  top-0 "/>
          </div>
          <SidebarMenuButton
            onClick={onNewChat}
            className="w-full mb-4 text-primary dark:text-primary-dark hover:translate-y-[-2px] hover:bg-border-color hover:dark:bg-background-dark transition-all ease-in-out font-family-regular cursor-pointer duration-200 active:translate-y-0 "
          >
            <img src={isDarkMode ? NewChatDark : NewChat} alt="" />
            New Chat
          </SidebarMenuButton>
          <SidebarMenuButton
           className="font-family-regular w-full text-primary dark:text-primary-dark hover:translate-y-[-2px] hover:bg-border-color hover:dark:bg-background-dark transition-all ease-in-out cursor-pointer duration-200 active:translate-y-0 "
          >
            <img src={isDarkMode ? SearchDark : Search} alt="" className="size-6" />
            Search Chats
          </SidebarMenuButton>
        </SidebarHeader>
        <div className="h-0.5 w-full bg-border-color"></div>
        <SidebarContent className="pt-8 bg-background-secondary dark:bg-background-secondary-dark text-primary dark:text-primary-dark">
          <SidebarGroupLabel className="font-family-semibold text-lg text-primary dark:text-primary-dark">Recent Chats</SidebarGroupLabel>
          <SidebarGroup>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem  
                className={`not-first-of-type:font-family-regular group/dropdown  
                  cursor-pointer rounded-md w-full text-primary dark:text-primary-dark hover:bg-border-color hover:dark:bg-background-dark transition-all ease-in-out  ${chat === activeChat ? 'bg-border-color dark:bg-background-dark font-family-bold' : ''}`}
                // className="group/dropdown"
                  key={chat}>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    isActive={chat === activeChat}
                    onClick={() => onSelectChat(chat)}
                  >
                    {chat}



                  </SidebarMenuButton>
                  <DropdownMenu >
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal className="cursor-pointer hidden group-hover/dropdown:block transition-all duration-200 ease-linear"/>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="space-y-1 z-100 bg-background-secondary border border-border-color-dark dark:border-border-color dark:bg-background-secondary-dark text-primary dark:text-primary-dark p-2 rounded-lg " side="right" align="start">
                        <DropdownMenuItem className="!text-primary flex dark:!text-primary-dark hover:dark:bg-background-dark border-0 outline-none hover:bg-border-color cursor-pointer rounded-md px-2 py-1 transition-all duration-200 ease-in-out text-sm hover:dark:text-primary font-family-regular ">
                          <PencilIcon className="size-4 mr-2" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className=" flex text-red-700  hover:bg-red-200 outline-none cursor-pointer rounded-md px-2 py-1 transition-all duration-200 ease-in-out text-sm font-family-regular ">
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
        <div className="h-0.5 w-full bg-border-color"></div>
        <SidebarFooter className="bg-background-secondary dark:bg-background-secondary-dark" >
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