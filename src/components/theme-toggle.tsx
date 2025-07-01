import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-background-secondary cursor-pointer dark:bg-background-secondary-dark  text-primary dark:text-primary-dark hover:bg-border-color hover:dark:bg-background-secondary-dark  " size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all text-primary dark:text-primary-dark  dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] text-primary dark:text-primary-dark  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background dark:bg-background-dark" align="end">
        <DropdownMenuItem className="!text-primary dark:!text-primary-dark hover:bg-border-color hover:dark:bg-background-secondary-dark  " onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-border-color hover:dark:bg-background-secondary-dark text-primary dark:!text-primary-dark  "
        onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-border-color hover:dark:bg-background-secondary-dark text-primary dark:!text-primary-dark  "
        onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}