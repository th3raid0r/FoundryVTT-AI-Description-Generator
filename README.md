![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FFoundryVTT-AI-Description-Generator%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)

# AI Description Generator - A System Configurable fork (SWN by default)
This module is a fork of PepijnMC's work that makes it compatible with the official Stars Without Number: Revised FoundryVTT System or ANY system, provided you know how to look up system mappings.

<!--- TODO - create a guide on how to find mappings and configure your system - use an example by converting back to D&D --->

> Although this module is completely free, the AI it uses is not. The module requires an API key obtained from https://beta.openai.com/account/api-keys and an OpenAI account with valid payment information. The pricing can be found at https://openai.com/api/pricing/, but on average you can expect each non-custom request made by this module to cost about $0.002 (2/10th of a single cent). It is advised to set a monthly usage limit if you are worried about costs, you can do so in your account settings here https://beta.openai.com/account/billing/limits.

> This module does not require any credentials except for your API key, which is stored locally in your Foundry settings. All billing is done from your OpenAI account. This key could be accessed by other programs and modules although they would have little reason to do so, nevertheless be careful and once again make sure to set a monthly limit to avoid unsuspected costs.

## System Support
By default your current rpg system is integrated into the prompt to give ChatGPT the context it needs. By the nature of ChatGPT it will work better for popular systems, or very well indexed free systems like Stars Without Number and worse for very niche systems without any free documents. If your system produces subpar results you can manually change the system in the settings to something that provides more context than just the system's name.

Known working systems:
- Dungeons and Dragons and other SRD content - may need to specify exact version if using 3.5.
- Pathfinder and other OGL derived systems
- Stars Without Number - A notable free system for Sci-Fi sandbox games. The one that this branch was initially designed for. 

### System Object Type Mappings

Additionally, some systems use entirely different object structures that may break non SWN systems by default. For this I've enabled rudimentary support for defining the objects involved with constructing descriptions from VTT data. 

#### Settings:
- **Context Mappings** 

**Default Value**:
```
{"character":{"lineage":"species","class":"class","background":"background","appearance":"biography"},"npc":{"appearance":"notes.right.contents"}}
```
**Explanation**:
This setting maps your system actor constructs to the internal ones. Don't change the first keys used, only the values they map to. NPCs may be moved to "Subject Type Mappings" for similar functionality to the original branch. Actor Types here usually require context consistency between scenes (i.e. characters and npcs so far). In the base system from PepijnMC mapped to "ActorData.details.race" for lineage, SWN by contrast used "ActorData.species". Thus this mapping assumes you are referring to ActorData and accessing an object within. Reverting back to that system should be as simple as updating the setting to:
```
{"character":{"lineage":"details.race","class":"classes",...
```

- **Subject Type Mappings**

**Default Value**:
```
{"mech":"mech","ship":"star ship","vehicle":"vehicle","faction":"faction","group":"group"}
```
**Explanation**:
Actor Types that do not require as much consistency. In the base system from PepijnMC, there was only "vehicle", "npc", and "group" as other types of actors to click on. In SWN there are other object names we need to recognize. So the first value must be a key that maps to a system actor object that.

- **Actor Context Templates**

**Default Value**:
```
{"character":" from a ${actorData.class} ${actorData.background} named ${actor.name}","npc":" from a ${actor.name}","ship":" from a ${actor.name} starship","vehicle":" from a ${actor.name} vehicle","mech":" from a ${actor.name} mech","drone":" from a ${actor.name} drone","faction":" from the ${actor.name} faction","group":" from a group of ${actor.name}"}
```
**Explanation**:
For item/power descriptions from a given actor type. Fairly straightforward and similar to the original implementation. Except that in the D&D system, classes are an array under actorData.classes.

- **Item Subject Type Mappings**

**Default Value**:
```
{"item":"item","cyberware":"cyberware","armor":"armor","focus":"focus${actorContext}","skill":"skill${actorContext}","power":"power${actorContext}","weapon":"attack${actorContext}","shipWeapon":"attack${actorContext}","shipDefense":"defense systems${actorContext}","shipFitting":"fitting${actorContext}","asset":"asset${actorContext}"}
```
**Explanation**:
In contrast to D&D based systems on FoundryVTT, SWN has many different item types that may or maynot need an actor context included in its description. (From Actor Context Templates, actually). 

TODO:
Some of these objects can be unified into a singular structure, and doing that would make things simpler to configure.
Dynamically interpret if any object property is an array, and if it is, stringify it before sending to chatGPT (as in the `dnd-mergeback` branch)

## Language Support
By default your current FoundryVTT language is integrated into the prompt to encourage ChatGPT to reply in that language. ChatGPT was trained mainly in English so the quality of results may vary in other languages.

If you want to have some fun, try out `Pirate Speech`.

![Pirate Speech Description](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Pirate%20Language.png?raw=true)

## Chat Context
Unique to this branch is chat context. This module can send between 0-100 of the most recent chat messages from FoundryVTT along with the system data. This is configurable under settings, helpfully labled **Maximum number of chat messages to fetch**. If you find that you don't put in that much information during the game, configure this value to only 2-3 messages. If you excusively use FoundryVTT text chat, larger values will help drastically! Chat context is sent in any operation under the assumption that the AI might find it helpful to know you are in a bustling tavern when you fetch the item description.  

## Chat Commands
There are two new commands available to the GM to send prompts to ChatGPT.

```
/gpt construct (subject)
```
- Constructs and sends a prompt similar to the Description Generator.
- The prompt is based on your settings and the provided `subject`.
- Examples:
  - `/gpt construct Ancient White Dragon`
  - `/gpt construct Beholder`
  - `/gpt construct Fireball spell`

```
/gpt send (prompt)
```
- Sends a custom `prompt`.
- Examples:
  - `/gpt send What does the Magic Missile spell do in dnd5e?`
  - `/gpt send What would be a fun low level encounter for a dnd5e game set in a jungle?`

## Description Generator
All actors, items, attacks, spells, and features have a button added in their header for the GM to request a short description generated by the AI based on your rpg system and world/setting. Responses are put in the Foundry chat and can optionally only be whispered to you.

![The button on the sheet](https://raw.githubusercontent.com/PepijnMC/FoundryVTT-AI-Description-Generator/main/media/Button.png)

### Player Characters (SWN/CWN Default -- Others Configurable)
The prompt constructed for PC actors is a bit different than for other actors. PCs use their lineage and classes as the `subject`, instead of using the actor's name. Anything written in the `biography` text box is also passed along as additional context. It is recommended to be short but concise to generate results that fit the character you have envisioned in your mind, for example: `male, wild white hair, steampunk clothing, red eyes`.

### Examples (OLD - From original D&D focused module)
**Adult Green Dragon**

![A description generated for an Adult Green Dragon](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Adult%20Green%20Dragon%20Description.png?raw=true)

**Air Elemental**

![A description generated for an Air Elemental](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Air%20Elemental%20Description.png?raw=true)

**Will O' Wisp**

![A description generated for a Will O' Wisp](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Will%20O'%20Wisp%20Description.png?raw=true)

**Alchemy Jug**

![A description generated for an Alchemy Jug](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Alchemy%20Jug%20Description.png?raw=true)

**Bag of Holding**

![A description generated for a Bag of Holding](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Bag%20Of%20Holding%20Description.png?raw=true)

**Flame Tongue Greatsword**

![A description generated for a Flame Tongue Greatsword](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Flame%20Tongue%20Greatsword%20Description.png?raw=true)

**Cone of Cold**

![A description generated for Cone of Cold](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Cone%20Of%20Cold%20Description.png?raw=true)

**Eldritch Blast**

![A description generated for Eldritch Blast](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Eldritch%20Blast%20Description.png?raw=true)

**Fireball**

![A description generated for Fireball](https://github.com/PepijnMC/FoundryVTT-AI-Description-Generator/blob/main/media/Fireball%20Description.png?raw=true)

## Issues and Requests
Please report issues and propose feature requests <a href="https://github.com/PepijnMC/AI-Description-Generator/issues" target="_blank">here</a>.

The module will never send a request to ChatGPT without being told to by pressing a button, using chat commands, or using the API in macros or other modules. Nevertheless if you ever suspect you are being charged for unprovoked requests from this module please disable the module immediately and raise a critical issue.

## API
> Requires the module's 'Enable API Functions' setting to be enabled.

> WARNING! Using any of these functions will send a request to OpenAI's API for which you will be charged like any other request made by this module. As such please be careful implenting them in macros and other modules. Test your code well before implementing these functions and I strongly advice users to avoid looping and recursive functions.

Functions to construct and send your own prompts are provided under `game.modules.get('ai-description-generator').api`:
- `constructPrompt(language, system, world, subject, subjectType, descriptionType, key)`: Construct and sends a prompt based on the provided context similar to how the base module does it.
	- `language`: The language ChatGPT will be encouraged to respond in. Use `game.settings.get('ai-description-generator', 'language')` to use the language provided in the module's/core's settings.
	- `system`: The RPG system to be used for context. Use `game.settings.get('ai-description-generator', 'system')` to use the system that was provided in the module's settings.
	- `world`: The world/setting to be used for context. Use `game.settings.get('ai-description-generator', 'world')` to use the world that was provided in the module's settings.
	- `subject`: The name of the subject.
	- `subjectType` (optional): Additional information about the nature of the `subject`, like `creature` or `spell`. Defaults to nothing.
	- `descriptionType` (optional): Additional information about what sort of description you want. Defaults to nothing but the module uses either `cool short sensory` or `cool short visual`.
	- `key` (optional): Your API key. Defaults to the API key provided by you in the module's settings.
- `sendPrompt(prompt, key)`: Sends a completely custom prompt.
	- `prompt`: The prompt you want to send.
	- `key` (optional): Your API key. Defaults to the API key provided by you in the module's settings.
