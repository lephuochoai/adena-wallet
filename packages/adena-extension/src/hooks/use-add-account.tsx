import { useRecoilState } from 'recoil';
import { WalletState } from '@states';
import { useAdenaContext, useWalletContext } from './use-context';
import { SeedAccount } from 'adena-module';
import { useCurrentAccount } from './use-current-account';

export type UseAddAccountReturn = {
  availAddAccount: () => Promise<boolean>;
  addAccount: () => Promise<boolean>;
};

export const useAddAccount = (): UseAddAccountReturn => {
  const { wallet, updateWallet } = useWalletContext();
  const { walletService } = useAdenaContext();
  const [, setState] = useRecoilState(WalletState.state);
  const { changeCurrentAccount } = useCurrentAccount();

  const availAddAccount = async (): Promise<boolean> => {
    const isExists = await walletService.existsWallet();
    return isExists;
  };

  const addAccount = async (): Promise<boolean> => {
    if (!wallet) {
      return false;
    }
    setState('LOADING');
    const account = await SeedAccount.createByWallet(wallet);
    account.index = wallet.lastAccountIndex + 1;
    account.name = `Account ${wallet.lastAccountIndex + 1}`;
    const clone = wallet.clone();
    clone.addAccount(account);
    const storedAccount = clone.accounts.find((storedAccount) => storedAccount.id === account.id);
    if (storedAccount) {
      await changeCurrentAccount(storedAccount);
    }
    await updateWallet(clone);
    setState('FINISH');
    return true;
  };

  return { availAddAccount, addAccount };
};
