import * as React from "react";

import { useMediaQuery } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { GameConfig } from "@/lib/types";
import { gameConfigs } from "@/features/game/game-config";

export function ComboBoxResponsive({
  setGameConfig,
}: {
  setGameConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedGameConfig, setSelectedGameConfig] =
    React.useState<GameConfig | null>(null);

  if (isDesktop) {
    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {selectedGameConfig ? (
                <>{selectedGameConfig.value}</>
              ) : (
                <>Set game</>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <GameConfigList
              setOpen={setOpen}
              setSelectedGameConfig={setSelectedGameConfig}
              setGameConfig={setGameConfig}
            />
          </PopoverContent>
        </Popover>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="justify-start">
          {selectedGameConfig ? <>{selectedGameConfig.value}</> : <>Set game</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <GameConfigList
            setOpen={setOpen}
            setSelectedGameConfig={setSelectedGameConfig}
            setGameConfig={setGameConfig}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function GameConfigList({
  setOpen,
  setSelectedGameConfig,
  setGameConfig,
}: {
  setOpen: (open: boolean) => void;
  setSelectedGameConfig: (config: GameConfig | null) => void;
  setGameConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter game..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {gameConfigs.map((config) => (
            <CommandItem
              key={config.value}
              value={config.value}
              onSelect={(value) => {
                const selectedConfig = gameConfigs.find(
                  (game) => game.value === value
                );
                if (selectedConfig) {
                  setSelectedGameConfig(selectedConfig);
                  setGameConfig(selectedConfig); // Pasar la configuración al componente principal
                }
                setOpen(false);
              }}
            >
              {config.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
