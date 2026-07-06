from abc import ABC, abstractmethod

class EmailProvider(ABC):
    """
    Abstract base class for email providers.
    All email sending implementations must inherit from this and implement send_email.
    """
    
    @abstractmethod
    async def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """
        Sends an email asynchronously.
        
        Args:
            to_email: The recipient's email address.
            subject: The subject of the email.
            html_body: The rendered HTML content of the email.
            
        Returns:
            True if successful, False otherwise.
        """
        pass
