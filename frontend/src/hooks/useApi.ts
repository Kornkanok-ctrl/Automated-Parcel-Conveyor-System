import { useState, useEffect } from 'react';
import { apiService, type Recipient, type DeliveryCompany } from '../services/api';

export function useRecipients(floor?: string) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsByFloor, setRecipientsByFloor] = useState<{[floor: string]: Recipient[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRecipients(floor);
      setRecipients(response.recipients);
      setRecipientsByFloor(response.recipientsByFloor);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recipients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, [floor]);

  return { recipients, recipientsByFloor, loading, error, refetch: fetchRecipients };
}

export function useDeliveryCompanies() {
  const [deliveryCompanies, setDeliveryCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveryCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDeliveryCompanies();
      setDeliveryCompanies(response.deliveryCompanies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryCompanies();
  }, []);

  return { deliveryCompanies, loading, error, refetch: fetchDeliveryCompanies };
}