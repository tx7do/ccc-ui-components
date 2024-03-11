import {ERaycast2DType, math, PhysicsSystem2D, RaycastResult2D} from "cc";

export default class Maths {
    static thePI180: number = Math.PI / 180;
    static the180PI: number = 180 / Math.PI;
    static maxDistance = 10000000;

    /**
     * @description 角度转弧度<br>
     *  公式: π / 180 * 角度
     *
     * @param {number} degrees 角度
     * @return {number} 弧度
     */
    static angleToRadian(degrees: number): number {
        return Maths.thePI180 * degrees;
    }

    /**
     * @description 弧度转角度<br>
     *  公式: 180 / π * 弧度
     *
     * @param {number} radian 弧度
     * @return {number} 角度
     */
    static radianToAngle(radian: number): number {
        return Maths.the180PI * radian;
    }

    /**
     * @description 角度转向量<br>
     *  公式: tan = sin / cos
     *
     * @param {number} degrees 角度
     * @return {Vec2} 向量
     */
    static angleToVector(degrees: number): math.Vec2 {
        // 将传入的角度转为弧度
        const radian: number = math.toRadian(degrees);
        // 算出cos,sin和tan
        const cos: number = Math.cos(radian);// 邻边 / 斜边
        const sin: number = Math.sin(radian);// 对边 / 斜边
        // 结合在一起并归一化
        return math.v2(cos, sin).normalize();
    }

    /**
     * @description 向量转角度<br>
     *  公式: tan = sin / cos
     *
     * @param {number} vector 向量
     * @return {number} 角度
     */
    static vectorToAngle(vector: math.Vec2): number {
        // 将传入的向量归一化
        const dir: math.Vec2 = vector.normalize();
        // 计算出目标角度的弧度
        const radian = dir.signAngle(math.v2(1, 0));
        // 把弧度计算成角度
        return -Maths.radianToAngle(radian);
    }

    static angleInRadians(p1: math.Vec2, p2: math.Vec2): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

    static angleInDegrees(p1: math.Vec2, p2: math.Vec2): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * Maths.the180PI;
    }

    /**
     * 计算两点之间的直线距离
     * @param p1 点1
     * @param p2 点2
     */
    static distance(p1: math.Vec2 | math.Vec3, p2: math.Vec2 | math.Vec3): number {
        const dx: number = p2.x - p1.x;
        const dy: number = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 以某点为圆心，生成圆周上等分点的坐标
     *
     * @param {number} r 半径
     * @param {math.Vec2} pos 圆心坐标
     * @param {number} count 等分点数量
     * @param {number} [randomScope=80] 等分点的随机波动范围
     * @returns {math.Vec2[]} 返回等分点坐标
     */
    static getCirclePoints(r: number, pos: math.Vec2, count: number, randomScope: number = 60): math.Vec2[] {
        let points: math.Vec2[] = [];
        const radians: number = Maths.thePI180 * Math.round(360 / count);
        for (let i: number = 0; i < count; i++) {
            const x: number = pos.x + r * Math.sin(radians * i);
            const y: number = pos.y + r * Math.cos(radians * i);
            points.unshift(math.v2(x + Math.random() * randomScope, y + Math.random() * randomScope));
        }
        return points;
    }

    /**
     * 获取值域中的随机数
     * @param min 最小值
     * @param max 最大值
     */
    static random(min: number, max?: number): number {
        if (max === undefined) {
            return Math.random() * min;
        }
        return min + Math.random() * (max - min);
    }

    /**
     * 随机获取数组中的元素
     * @param arr
     */
    static getArrayRandomElement(arr: any[]): any {
        return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
    }

    /**
     * Clamps (or clips or confines) the value to be between min and max.
     */
    static clamp(value: number, min: number, max: number): number {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    /**
     * 旋转二维向量
     * @param vector
     * @param angle 角度
     */
    static rotateVec2(vector: math.Vec2, angle: number): math.Vec2 {
        const theta: number = math.toRadian(angle); // radians
        let matrix: number[] = [
            Math.cos(theta), Math.sin(theta),
            -Math.sin(theta), Math.cos(theta)
        ];

        return math.v2(
            matrix[0] * vector.x + matrix[1] * vector.y,
            matrix[2] * vector.x + matrix[3] * vector.y
        );
    }

    /**
     * 计算前方另一个点
     * @param startPos 起始点
     * @param radian 弧度
     * @param distance 距离
     */
    static getDistancePosition(startPos: math.Vec2, radian: number, distance: number): math.Vec2 {
        const moveX = distance * Math.cos(radian);
        const moveY = distance * Math.sin(radian);
        return math.v2(startPos.x + moveX, startPos.y + moveY);
    }

    /**
     * 射线测试
     * @param startPos 起始点
     * @param radian 弧度
     */
    static testRaycast(startPos: math.Vec2, radian: number): readonly Readonly<RaycastResult2D>[] {
        const p2 = Maths.getDistancePosition(startPos, radian, 4000);
        // console.log(startPos, p2);
        return PhysicsSystem2D.instance.raycast(startPos, p2, ERaycast2DType.Closest);
    }
}
