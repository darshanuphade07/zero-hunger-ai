from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute agent's specialized reasoning task."""
        pass

    def get_metadata(self) -> Dict[str, str]:
        return {
            "name": self.name,
            "description": self.description
        }
