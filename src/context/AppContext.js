import React, { Component, createContext } from "react";

import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

let lockerABI = require("../abi/Locker.json");
let lockerAddress = "0xCc272737466870f46832D1eC637Add05121bbbAD";

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: process.env.REACT_APP_INFURA_ID,
        },
    },
};

const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: false,
    providerOptions,
});

export const AppContext = createContext();

class AppContextProvider extends Component {
    state = {
        address: "",
        provider: "",
        web3: "",
        locker: "",
        client_address: "",
        isClient: false,
        escrow_index: "",
        raid_id: "",
        project_name: "",
        client_name: "",
        start_date: "",
        end_date: "",
        link_to_details: "",
        brief_description: "",
    };

    componentDidMount() {
        const web3 = new Web3(
            new Web3.providers.HttpProvider(
                `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`
            )
        );
        const locker = new web3.eth.Contract(lockerABI, lockerAddress);

        this.setState({ web3, locker });
    }

    setAirtableState = (params) => {
        this.setState(
            {
                escrow_index: params.escrow_index,
                raid_id: params.raid_id,
                project_name: params.project_name,
                client_name: params.client_name,
                start_date: params.start_date,
                end_date: params.end_date,
                link_to_details: params.link_to_details,
                brief_description: params.brief_description,
            },
            () => this.fetchLockerInfo()
        );
    };

    fetchLockerInfo = async () => {
        if (this.state.escrow_index !== "") {
            let result = await this.state.locker.methods
                .lockers(this.state.escrow_index)
                .call();
            this.setState({ client_address: result.client });
            // console.log(result);
        }
    };

    connectAccount = async () => {
        web3Modal.clearCachedProvider();

        const provider = await web3Modal.connect();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();

        let isClient = false;

        if (accounts[0] === this.state.client_address) {
            isClient = true;
        }

        this.setState({ address: accounts[0], provider, web3, isClient });
    };

    render() {
        return (
            <AppContext.Provider
                value={{
                    ...this.state,
                    setAirtableState: this.setAirtableState,
                    connectAccount: this.connectAccount,
                }}
            >
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

export default AppContextProvider;
