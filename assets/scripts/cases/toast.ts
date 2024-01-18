import {_decorator, Component} from 'cc';
import Toast from "db://assets/lib/toast/toast";

const {ccclass, property} = _decorator;

@ccclass('toast')
export class toast extends Component {
    async start() {
        await Toast.show('Welcome!');
    }

    async handleShowToast() {
        await Toast.show('Show Toast!');
    }
}
