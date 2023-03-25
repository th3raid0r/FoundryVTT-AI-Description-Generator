function getContextValues(actorType, actorData) {
    const defaultMappings = {
      character: {
        lineage: 'species',
        class: 'class',
        background: 'background',
        appearance: 'biography'
      },
      npc: {
        appearance: 'notes.right.contents'
      }
    };
  
    const userMappings = game.settings.get('ai-description-generator', 'contextMappings') || {};
  
    const contextKeys = Object.keys(defaultMappings[actorType]);
    const contextValues = {};
  
    for (const key of contextKeys) {
      const mapping = userMappings[actorType]?.[key] || defaultMappings[actorType][key];
      contextValues[key] = getProperty(actorData, mapping);
    }
  
    return contextValues;
}

function getSubjectWithContext(subjectTypeMapping, subjectType, actorContext) {
    const subject = subjectTypeMapping[subjectType] || subjectType;
    return subject.replace('{actorContext}', actorContext);
}

function getActorContext(contextTemplate, actorData, actor) {
  return new Function('actorData', 'actor', 'return `' + contextTemplate + '`')(actorData, actor);
}